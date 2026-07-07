import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

/**
 * Reusable empty state component for tables and lists.
 */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
      {icon && <div className="text-slate-200 mb-3">{icon}</div>}
      <h4 className="text-[13px] font-bold text-slate-700">{title}</h4>
      {description && (
        <p className="text-xs text-slate-400 mt-1 max-w-70">
          {description}
        </p>
      )}
    </div>
  );
}
