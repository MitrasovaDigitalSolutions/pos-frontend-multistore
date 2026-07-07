import { Input } from "@/components/ui/input";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface NumberInputProps extends Omit<
    React.ComponentProps<typeof Input>,
    "value" | "onChange"
> {
    value: number | null;
    onChange: (val: number | null) => void;
    allowNegative?: boolean;
    allowDecimal?: boolean;
    min?: number;
    max?: number;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({
        value,
        onChange,
        allowNegative = false,
        allowDecimal = true,
        min,
        max,
        className,
        disabled,
        onBlur,
        ...props
    }, ref) => {
        const inputRef = useRef<HTMLInputElement | null>(null);
        const [cursorPosition, setCursorPosition] = useState<number | null>(null);
        const [localValue, setLocalValue] = useState<string>("");

        // Format helper: converting JS number (or string) to Indonesian display (dot thousands, comma decimals)
        const formatNumber = (val: string | number | null | undefined): string => {
            if (val === null || val === undefined || val === "") return "";

            let str = String(val);
            const isNegative = allowNegative && str.startsWith("-");

            if (isNegative) {
                str = str.substring(1);
            }

            // Convert input JS number (e.g. 10900.85) to display string format with comma for decimal
            str = str.replace(/\./g, ",");

            const parts = str.split(",");
            const integerPart = parts[0].replace(/\D/g, "");
            const formattedInteger = integerPart ? new Intl.NumberFormat("id-ID").format(Number(integerPart)) : "";

            let formattedResult = formattedInteger;
            if (allowDecimal && parts.length > 1) {
                const decimalPart = parts[1].replace(/\D/g, "");
                formattedResult = `${formattedInteger},${decimalPart}`;
            }

            return isNegative ? `-${formattedResult}` : formattedResult;
        };

        // Parse helper: converting Indonesian display value back to standard JavaScript float/int
        const parseNumber = (val: string): number | null => {
            if (!val) return null;

            const isNegative = allowNegative && val.startsWith("-");
            let clean = val;
            if (isNegative) {
                clean = clean.substring(1);
            }

            // Remove dot (thousands) and change comma to dot (decimals)
            clean = clean.replace(/\./g, "").replace(/,/g, ".");

            const parts = clean.split(".");
            const integerPart = parts[0].replace(/\D/g, "");
            let num: number;
            if (allowDecimal && parts.length > 1) {
                const decimalPart = parts[1].replace(/\D/g, "");
                const combined = `${integerPart}.${decimalPart}`;
                num = parseFloat(combined);
            } else {
                num = parseInt(integerPart, 10);
            }

            if (isNaN(num)) return null;
            return isNegative ? -num : num;
        };

        // Sync local value with external changes in value prop
        useEffect(() => {
            const parsedLocal = parseNumber(localValue);
            const parsedVal = value !== null && value !== undefined ? Number(value) : null;
            if (parsedLocal !== parsedVal) {
                setLocalValue(formatNumber(value));
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [value]);

        // Restore cursor position after formatting state updates
        useLayoutEffect(() => {
            if (inputRef.current && cursorPosition !== null) {
                inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
                setCursorPosition(null);
            }
        }, [cursorPosition]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target;
            let rawValue = input.value;
            const selectionStart = input.selectionStart || 0;

            // If user cleared the input
            if (rawValue === "") {
                setLocalValue("");
                onChange(null);
                return;
            }

            // Strip any minus sign if allowNegative is false
            if (!allowNegative) {
                rawValue = rawValue.replace(/-/g, "");
            } else {
                // If allowNegative is true, only allow a single minus sign at the very beginning
                if (rawValue.includes("-")) {
                    const startsWithMinus = rawValue.startsWith("-");
                    const rest = rawValue.replace(/-/g, "");
                    rawValue = startsWithMinus ? `-${rest}` : rest;
                }
            }

            // Convert typed dot '.' into comma ',' for decimal parsing if decimal is allowed
            if (allowDecimal && selectionStart > 0 && rawValue[selectionStart - 1] === ".") {
                rawValue = rawValue.substring(0, selectionStart - 1) + "," + rawValue.substring(selectionStart);
            }

            // Standardize digits and separator
            let parsed = parseNumber(rawValue);

            // Clamp value to max immediately on change if max is defined
            if (parsed !== null && max !== undefined && parsed > max) {
                parsed = max;
                rawValue = String(max);
            }

            // Count "content characters" (digits, commas, and minus) before cursor to adjust cursor selection
            const regex = allowDecimal ? /[^0-9,-]/g : /[^0-9-]/g;
            const contentBeforeCursor = rawValue
                .substring(0, selectionStart)
                .replace(regex, "").length;

            // Generate new display value
            const newFormatted = formatNumber(rawValue.replace(/\./g, ""));
            setLocalValue(newFormatted);

            // Call onChange with the raw numeric parsed float/int
            onChange(parsed);

            // Recalculate new selection/cursor position
            let newSelectionStart = 0;
            let contentCount = 0;
            const checkRegex = allowDecimal ? /[0-9,-]/ : /[0-9-]/;
            for (let i = 0; i < newFormatted.length; i++) {
                if (contentCount === contentBeforeCursor) {
                    break;
                }
                if (checkRegex.test(newFormatted[i])) {
                    contentCount++;
                }
                newSelectionStart = i + 1;
            }

            setCursorPosition(newSelectionStart);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            const parsed = parseNumber(localValue);
            if (parsed !== null) {
                let adjusted = parsed;
                if (min !== undefined && adjusted < min) {
                    adjusted = min;
                }
                if (max !== undefined && adjusted > max) {
                    adjusted = max;
                }
                setLocalValue(formatNumber(adjusted));
                onChange(adjusted);
            } else {
                setLocalValue(formatNumber(value));
                onChange(value);
            }
            onBlur?.(e);
        };

        return (
            <Input
                ref={(node) => {
                    inputRef.current = node;
                    if (typeof ref === "function") {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                type="text"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                className={className}
                {...props}
            />
        );
    }
);

NumberInput.displayName = "NumberInput";
