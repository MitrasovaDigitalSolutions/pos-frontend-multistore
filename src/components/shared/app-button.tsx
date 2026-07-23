import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AppButtonProps extends React.ComponentProps<typeof Button> {
  /** Shows a loading spinner and disables the button */
  isLoading?: boolean;
  /** Text to display while loading (defaults to children) */
  loadingText?: string;
  /** Icon rendered before the button text/children */
  leftIcon?: React.ReactNode;
  /** Icon rendered after the button text/children */
  rightIcon?: React.ReactNode;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      children,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin shrink-0" />
            {loadingText ? <span>{loadingText}</span> : children}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
          </>
        )}
      </Button>
    );
  }
);

AppButton.displayName = "AppButton";

export default AppButton;
