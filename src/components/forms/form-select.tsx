"use client";

import { useState, useMemo } from "react";
import { useFormContext, Controller, type FieldPath, type FieldValues, type FieldError, type FieldErrors } from "react-hook-form";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export interface AsyncQueryParams {
    search?: string;
    page?: number;
    per_page?: number;
}

export interface AsyncQueryResult<TData = unknown> {
    data?: { pages?: { data?: TData[] }[] } | unknown;
    isLoading: boolean;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    fetchNextPage?: () => void;
}

export interface FormSelectProps<T extends FieldValues, TData = unknown> {
    name: FieldPath<T>;
    label?: string;
    /** Static list of options */
    options?: CommandOption[];

    /**
     * Optional async query hook for backend search & infinite scroll pagination.
     * Example: useAsyncQuery={(params) => useInfiniteReceivings(params)}
     */
    useAsyncQuery?: (params: AsyncQueryParams) => AsyncQueryResult<TData>;
    /**
     * Converter function to transform raw backend entity (TData) into CommandOption.
     * Example: mapOption={(item) => ({ value: item.uid, label: item.nomor_penerimaan, description: ... })}
     */
    mapOption?: (item: TData) => CommandOption;
    /** Optional fallback option generator if currently selected value is not yet in fetched pages */
    getExtraOption?: (value: string) => CommandOption | undefined;

    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    isLoading?: boolean;
    onSearchChange?: (search: string) => void;
    onScrollBottom?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    onChange?: (value: string) => void;
    className?: string;
    wrapperClassName?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    maxLabelLength?: number;
    leftIcon?: React.ReactNode;
    rightElement?: React.ReactNode;
}

const defaultAsyncHook = (): AsyncQueryResult => ({
    data: undefined,
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: () => {},
});

export function FormSelect<T extends FieldValues, TData = unknown>({
    name,
    label,
    options,
    useAsyncQuery,
    mapOption,
    getExtraOption,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    isLoading,
    onSearchChange,
    onScrollBottom,
    hasMore,
    isLoadingMore,
    onChange,
    className,
    wrapperClassName,
    disabled,
    size = "md",
    maxLabelLength,
    leftIcon,
    rightElement,
}: FormSelectProps<T, TData>) {
    const {
        control,
        formState: { errors },
    } = useFormContext<T>();

    // Search & Debounce state for async mode
    const [internalSearch, setInternalSearch] = useState("");
    const debouncedSearch = useDebounce(internalSearch, 400);

    // Call async query hook unconditionally to strictly follow Rules of Hooks
    const queryHook = useAsyncQuery || defaultAsyncHook;
    const asyncResult = queryHook({
        search: debouncedSearch || undefined,
        per_page: 10,
    });

    const asyncData = asyncResult?.data;

    const computedOptions = useMemo(() => {
        if (useAsyncQuery && mapOption && asyncData) {
            const dataObj = asyncData as { pages?: { data?: TData[] }[]; data?: TData[] };
            const pages = dataObj.pages || (Array.isArray(asyncData) ? [asyncData] : [dataObj.data]);
            const items: TData[] = pages.flatMap((p: unknown) => {
                if (p && typeof p === "object" && "data" in p && Array.isArray((p as { data: unknown }).data)) {
                    return (p as { data: TData[] }).data;
                }
                if (Array.isArray(p)) {
                    return p as TData[];
                }
                return [];
            });
            return items.map(mapOption);
        }
        return options || [];
    }, [useAsyncQuery, mapOption, asyncData, options]);

    const effectiveIsLoading = isLoading || (useAsyncQuery ? asyncResult.isLoading : false);
    const effectiveIsLoadingMore = isLoadingMore || (useAsyncQuery ? !!asyncResult.isFetchingNextPage : false);
    const effectiveHasMore = hasMore !== undefined ? hasMore : (useAsyncQuery ? !!asyncResult.hasNextPage : false);

    const handleSearchChange = (val: string) => {
        if (useAsyncQuery) {
            setInternalSearch(val);
        }
        if (onSearchChange) {
            onSearchChange(val);
        }
    };

    const handleScrollBottom = () => {
        if (useAsyncQuery && asyncResult.fetchNextPage && asyncResult.hasNextPage && !asyncResult.isFetchingNextPage) {
            asyncResult.fetchNextPage();
        }
        if (onScrollBottom) {
            onScrollBottom();
        }
    };

    // Helper to resolve nested errors, e.g. "items.0.product_uid" -> errors.items[0].product_uid
    const getNestedValue = (
        obj: FieldErrors<T>,
        path: string,
    ): FieldError | undefined => {
        const value = path
            .split(/[.[\]]+/)
            .filter(Boolean)
            .reduce<unknown>((prev, curr) => {
                if (prev && typeof prev === "object") {
                    return (prev as Record<string, unknown>)[curr];
                }
                return undefined;
            }, obj);
        return value as FieldError | undefined;
    };

    const error = getNestedValue(errors, name);

    return (
        <div className={cn("space-y-1.5", wrapperClassName)}>
            {label && (
                <label
                    htmlFor={name}
                    className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                    {label}
                </label>
            )}
            <Controller
                name={name}
                control={control}
                render={({ field }) => {
                    const fieldValueStr = field.value !== undefined && field.value !== null ? String(field.value) : "";

                    // Preserve selected option if not yet in fetched pages
                    const rawOptions = [...computedOptions];
                    if (fieldValueStr && !rawOptions.some((opt) => opt.value === fieldValueStr)) {
                        if (getExtraOption) {
                            const extraOpt = getExtraOption(fieldValueStr);
                            if (extraOpt) {
                                rawOptions.unshift(extraOpt);
                            }
                        }
                    }

                    // Deduplicate options by value to prevent React duplicate key warnings
                    const uniqueOptionsMap = new Map<string, CommandOption>();
                    rawOptions.forEach((opt) => {
                        if (!uniqueOptionsMap.has(opt.value)) {
                            uniqueOptionsMap.set(opt.value, opt);
                        }
                    });
                    const finalOptions = Array.from(uniqueOptionsMap.values());

                    return (
                        <CommandSelect
                            options={finalOptions}
                            value={fieldValueStr}
                            onChange={(val) => {
                                const originalValue = field.value;
                                if (typeof originalValue === "number") {
                                    field.onChange(val === "" ? "" : Number(val));
                                } else {
                                    field.onChange(val);
                                }
                                if (onChange) {
                                    onChange(val);
                                }
                            }}
                            placeholder={placeholder}
                            searchPlaceholder={searchPlaceholder}
                            emptyMessage={emptyMessage}
                            isLoading={effectiveIsLoading}
                            onSearchChange={handleSearchChange}
                            onScrollBottom={handleScrollBottom}
                            hasMore={effectiveHasMore}
                            isLoadingMore={effectiveIsLoadingMore}
                            className={cn(
                                error && "border-rose-400 focus:border-rose-400 focus:ring-rose-500/20",
                                className
                            )}
                            disabled={disabled}
                            size={size}
                            maxLabelLength={maxLabelLength}
                            leftIcon={leftIcon}
                            rightElement={rightElement}
                        />
                    );
                }}
            />
            {error && (
                <p className="text-[10px] text-rose-500 font-medium">
                    {error.message}
                </p>
            )}
        </div>
    );
}
