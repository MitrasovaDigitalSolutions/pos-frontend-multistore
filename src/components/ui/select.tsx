import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  wrapperClassName?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, children, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center", wrapperClassName)}>
        <select
          className={cn(
            "w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-bold text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2.5 h-4 w-4 pointer-events-none text-slate-500" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
