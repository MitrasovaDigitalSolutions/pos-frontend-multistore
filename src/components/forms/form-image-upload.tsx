"use client";

import { useFormContext, Controller, type FieldPath, type FieldValues } from "react-hook-form";
import { useState, useEffect, useMemo, useRef } from "react";
import { IconUpload, IconTrash, IconAlertCircle } from "@tabler/icons-react";
import { cn, getImageUrl } from "@/lib/utils";

interface FormImageUploadProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string;
    disabled?: boolean;
    className?: string;
    dropzoneClassName?: string;
    initialUrl?: string | null;
}

export function FormImageUpload<T extends FieldValues>({
    name,
    label,
    disabled = false,
    className,
    dropzoneClassName,
    initialUrl,
}: FormImageUploadProps<T>) {
    const {
        control,
        watch,
        formState: { errors },
    } = useFormContext<T>();

    const error = errors[name];
    const fieldValue = watch(name);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Derive previewUrl directly during render using useMemo
    const previewUrl = useMemo(() => {
        if (typeof window !== "undefined" && (fieldValue as unknown) instanceof File) {
            return URL.createObjectURL(fieldValue as unknown as File);
        }
        if (typeof fieldValue === "string" && fieldValue.trim() !== "") {
            return getImageUrl(fieldValue);
        }
        if (fieldValue === null) {
            return null;
        }
        if (initialUrl) {
            return getImageUrl(initialUrl);
        }
        return null;
    }, [fieldValue, initialUrl]);

    // Clean up blob URL when previewUrl changes or component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (file: File | null, onChange: (val: File | null) => void) => {
        if (!file) {
            onChange(null);
            return;
        }

        // Validate image file type
        if (!file.type.startsWith("image/")) {
            alert("Harap pilih file gambar saja (JPG, PNG, WEBP).");
            return;
        }

        // Validate image size (e.g., max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran gambar tidak boleh melebihi 2MB.");
            return;
        }

        onChange(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent, onChange: (val: File | null) => void) => {
        e.preventDefault();
        setIsDragOver(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileChange(files[0], onChange);
        }
    };

    const handleRemove = (e: React.MouseEvent, onChange: (val: File | null) => void) => {
        e.stopPropagation();
        e.preventDefault();

        onChange(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {label}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <div
                        onClick={() => !disabled && fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, field.onChange)}
                        className={cn(
                            "relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 transition-all duration-200 cursor-pointer overflow-hidden",
                            isDragOver
                                ? "border-emerald-500 bg-emerald-50/20"
                                : error
                                    ? "border-rose-300 bg-rose-50/10 hover:border-rose-400"
                                    : "border-slate-200 bg-slate-50/20 hover:border-emerald-500 hover:bg-slate-50/50",
                            disabled && "opacity-50 cursor-not-allowed",
                            dropzoneClassName || "h-full min-h-[220px] md:min-h-[300px]"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            disabled={disabled}
                            onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                    handleFileChange(files[0], field.onChange);
                                }
                            }}
                        />

                        {previewUrl ? (
                            <div className="relative w-full h-full group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="Preview Gambar"
                                    className="w-full h-full object-contain rounded-xl"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemove(e, field.onChange)}
                                        className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg border-none cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase transition-transform scale-90 group-hover:scale-100"
                                    >
                                        <IconTrash size={14} />
                                        Hapus Gambar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                                    <IconUpload size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-bold text-slate-700">
                                        Klik untuk unggah atau seret berkas
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        PNG, JPG, JPEG atau WEBP (Maks. 2MB)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            />

            {error && (
                <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                    <IconAlertCircle size={12} />
                    {error.message as string}
                </p>
            )}
        </div>
    );
}
