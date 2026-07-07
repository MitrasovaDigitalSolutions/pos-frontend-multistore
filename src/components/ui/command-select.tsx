import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "@/lib/utils"

export interface CommandOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

interface CommandSelectProps {
  options: CommandOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  isLoading?: boolean
  onSearchChange?: (search: string) => void
  className?: string
  wrapperClassName?: string
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  maxLabelLength?: number
}

// ─── Command Context ─────────────────────────────────────────────────────────
const CommandContext = React.createContext<{
  search: string
  setSearch: (s: string) => void
  selectedValue?: string
  onSelect?: (val: string) => void
  disableLocalFilter?: boolean
}>({
  search: "",
  setSearch: () => { },
})

// ─── Command (Wrapper) ───────────────────────────────────────────────────────
export const Command = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> & {
    selectedValue?: string
    onSelect?: (val: string) => void
    disableLocalFilter?: boolean
  }
>(({ className, children, selectedValue, onSelect, disableLocalFilter, ...props }, ref) => {
  const [search, setSearch] = React.useState("")
  return (
    <CommandContext.Provider value={{ search, setSearch, selectedValue, onSelect, disableLocalFilter }}>
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-slate-950 border border-slate-100 shadow-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
})
Command.displayName = "Command"

// ─── CommandInput ────────────────────────────────────────────────────────────
export const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onValueChange?: (val: string) => void
  }
>(({ className, onValueChange, ...props }, ref) => {
  const { search, setSearch } = React.useContext(CommandContext)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    onValueChange?.(val)
  }

  return (
    <div className="flex items-center border-b border-slate-100 px-3 py-1 bg-slate-50/10" cmdk-input-wrapper="">
      <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50 text-slate-400" />
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        value={search}
        onChange={handleChange}
        {...props}
      />
    </div>
  )
})
CommandInput.displayName = "CommandInput"

// ─── CommandList ─────────────────────────────────────────────────────────────
export const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("max-h-[200px] overflow-y-auto overflow-x-hidden p-1 custom-scrollbar", className)}
      {...props}
    />
  )
})
CommandList.displayName = "CommandList"

// ─── CommandEmpty ────────────────────────────────────────────────────────────
export const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isLoading?: boolean
  }
>(({ className, isLoading, children, ...props }, ref) => {
  if (isLoading) {
    return (
      <div
        ref={ref}
        className={cn("py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5", className)}
        {...props}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
        <span>Memuat data...</span>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn("py-4 text-center text-xs text-slate-400", className)}
      {...props}
    >
      {children || "Tidak ada hasil ditemukan."}
    </div>
  )
})
CommandEmpty.displayName = "CommandEmpty"

// ─── CommandItem ─────────────────────────────────────────────────────────────
export const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    keywords?: string[]
    disabled?: boolean
  }
>(({ className, value, keywords = [], disabled, children, onClick, ...props }, ref) => {
  const { search, selectedValue, onSelect, disableLocalFilter } = React.useContext(CommandContext)

  // Local filtering if no remote API search is active
  const matches = React.useMemo(() => {
    if (disableLocalFilter) return true
    if (!search) return true
    const searchLower = search.toLowerCase()
    const labelText = typeof children === "string" ? children.toLowerCase() : ""
    const valueLower = value.toLowerCase()

    return (
      labelText.includes(searchLower) ||
      valueLower.includes(searchLower) ||
      keywords.some((k) => k.toLowerCase().includes(searchLower))
    )
  }, [search, value, children, keywords, disableLocalFilter])

  if (!matches) return null

  const isSelected = selectedValue === value

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onSelect?.(value)
    onClick?.(e)
  }

  return (
    <div
      ref={ref}
      data-disabled={disabled}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-lg px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-slate-50 hover:text-slate-900 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        isSelected && "bg-emerald-50/50 text-emerald-700 font-bold",
        className
      )}
      onClick={handleSelect}
      {...props}
    >
      {isSelected && <Check className="mr-2 h-3.5 w-3.5 text-emerald-600 shrink-0" />}
      <div className={cn("min-w-0 flex-1 text-left", !isSelected && "pl-[22px]")}>{children || value}</div>
    </div>
  )
})
CommandItem.displayName = "CommandItem"

// ─── High-Level CommandSelect ────────────────────────────────────────────────
export function CommandSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari opsi...",
  emptyMessage = "Tidak ada hasil ditemukan.",
  isLoading = false,
  onSearchChange,
  className,
  wrapperClassName,
  disabled = false,
  size = "sm",
  maxLabelLength,
}: CommandSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === value)

  const sizeClasses = {
    sm: "h-8 text-xs font-normal text-slate-700",
    md: "h-10 text-xs font-normal text-slate-800",
    lg: "h-12 text-sm font-normal text-slate-800",
  }[size]

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
  }

  return (
    <div className={cn("relative w-full max-w-full min-w-0", wrapperClassName)}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          render={
            <button
              type="button"
              disabled={disabled}
              title={selectedOption ? selectedOption.label : undefined}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] w-full max-w-full items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 outline-none transition-all hover:bg-slate-50 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer overflow-hidden",
                sizeClasses,
                className
              )}
            >
              <span className="truncate text-left">{selectedOption ? selectedOption.label : placeholder}</span>
              <ChevronsUpDown className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-50 justify-self-end" />
            </button>
          }
        />

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            align="start"
            side="bottom"
            sideOffset={4}
            className="isolate z-50"
          >
            <PopoverPrimitive.Popup
              className="w-(--anchor-width) min-w-[150px] max-h-[300px] origin-(--transform-origin) animate-in fade-in-0 zoom-in-95 duration-100 outline-none overflow-hidden"
            >
              <Command selectedValue={value} onSelect={handleSelect} disableLocalFilter={!!onSearchChange} className="shadow-lg">
                <CommandInput
                  placeholder={searchPlaceholder}
                  onValueChange={onSearchChange}
                  autoFocus
                />
                <CommandList>
                  {isLoading && (
                    <CommandEmpty isLoading={true} />
                  )}
                  {!isLoading && options.length === 0 && (
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                  )}
                  {!isLoading &&
                    options.map((opt) => {
                      const truncatedLabel = 
                        maxLabelLength && opt.label.length > maxLabelLength
                          ? opt.label.substring(0, maxLabelLength) + "..."
                          : opt.label;
                      return (
                        <CommandItem 
                          key={opt.value} 
                          value={opt.value}
                          disabled={opt.disabled}
                          keywords={[opt.label, opt.description || ""]}
                          title={opt.description ? `${opt.label} (${opt.description})` : opt.label}
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-semibold text-slate-800 truncate block">{truncatedLabel}</span>
                            {opt.description && (
                              <span className="text-[10px] text-slate-400 font-normal truncate block">{opt.description}</span>
                            )}
                          </div>
                        </CommandItem>
                      )
                    })}
                </CommandList>
              </Command>
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}
