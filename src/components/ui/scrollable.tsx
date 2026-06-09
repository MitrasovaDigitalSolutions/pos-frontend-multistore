"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { cn } from "@/lib/utils"

interface ScrollableProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  orientation?: "vertical" | "horizontal"
  scrollbarClassName?: string
  thumbClassName?: string
}

export const Scrollable = React.forwardRef<HTMLDivElement, ScrollableProps>(
  ({ className, children, orientation = "vertical", scrollbarClassName, thumbClassName, ...props }, ref) => {
    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        data-slot="scrollable"
        className={cn("relative flex flex-col min-h-0 group/scrollable", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          data-slot="scrollable-viewport"
          className="flex-1 min-h-0 w-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar
          data-slot="scrollable-scrollbar"
          data-orientation={orientation}
          orientation={orientation}
          className={cn(
            "scrollable-scrollbar flex touch-none p-px select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
            // Base tailwind fallback styling
            "opacity-0 transition-opacity duration-300",
            "group-hover/scrollable:opacity-100 group-data-[scrolling]/scrollable:opacity-100 data-[scrolling]:opacity-100",
            scrollbarClassName
          )}
        >
          <ScrollAreaPrimitive.Thumb
            data-slot="scrollable-thumb"
            className={cn("relative flex-1 rounded-full bg-slate-400/40 dark:bg-slate-700/40 hover:bg-slate-500/60 dark:hover:bg-slate-600/60 transition-colors", thumbClassName)}
          />
        </ScrollAreaPrimitive.Scrollbar>
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    )
  }
)

Scrollable.displayName = "Scrollable"
