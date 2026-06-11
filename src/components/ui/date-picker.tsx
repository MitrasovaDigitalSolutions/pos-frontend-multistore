"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { id } from "date-fns/locale"
import { IconCalendar, IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: string | Date | null
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  label?: string
  clearable?: boolean
  size?: "sm" | "md" | "lg"
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Pilih tanggal...",
      disabled = false,
      className,
      error,
      label,
      clearable = true,
      size = "md",
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)

    const sizeClasses = {
      sm: "h-8 text-xs font-bold text-slate-700",
      md: "h-10 text-xs font-medium text-slate-800",
      lg: "h-12 text-sm font-medium text-slate-800",
    }[size]

    // Parse value to Date
    const selectedDate = React.useMemo(() => {
      if (!value) return undefined
      if (value instanceof Date) return isValid(value) ? value : undefined
      const parsed = parse(value, "yyyy-MM-dd", new Date())
      return isValid(parsed) ? parsed : undefined
    }, [value])

    const handleSelect = (date: Date | undefined) => {
      if (!date) {
        onChange?.("")
      } else {
        onChange?.(format(date, "yyyy-MM-dd"))
      }
      setOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.("")
    }

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        {label && (
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </span>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                ref={ref}
                type="button"
                variant="outline"
                disabled={disabled}
                className={cn(
                  "w-full justify-start text-left border-slate-200 bg-white dark:bg-slate-950 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-800 rounded-xl relative pr-10 transition-colors focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500",
                  sizeClasses,
                  !selectedDate && "text-slate-400",
                  error && "border-rose-400 focus-visible:ring-rose-500/20",
                  disabled && "opacity-50 pointer-events-none bg-slate-50"
                )}
                {...props}
              >
                <IconCalendar className={cn("mr-2 h-4 w-4 shrink-0 text-slate-400 transition-colors", selectedDate && "text-emerald-600")} />
                {selectedDate ? (
                  format(selectedDate, "dd MMMM yyyy", { locale: id })
                ) : (
                  <span>{placeholder}</span>
                )}

                {clearable && selectedDate && !disabled && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                )}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              className="p-3"
            />
          </PopoverContent>
        </Popover>

        {error && (
          <p className="text-[10px] text-rose-500 font-medium">
            {error}
          </p>
        )}
      </div>
    )
  }
)

DatePicker.displayName = "DatePicker"
