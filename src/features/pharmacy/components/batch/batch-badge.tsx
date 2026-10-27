import { Badge } from "@/components/ui/badge";
import { formatDate, parseToDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconCheck, IconClock, IconX } from "@tabler/icons-react";
import { EXPIRATION_THRESHOLDS } from "../../constants/pharmacy-constants";

interface BatchBadgeProps {
    expiredDate?: string | null;
    batchNumber?: string;
    stock?: number;
    showFullInfo?: boolean;
    className?: string;
}

export function BatchBadge({
    expiredDate,
    batchNumber,
    stock,
    showFullInfo = false,
    className,
}: BatchBadgeProps) {
    if (!expiredDate) {
        return (
            <Badge variant="secondary" className={cn("text-[9px] font-medium", className)}>
                Tanpa Expired
            </Badge>
        );
    }

    const parsedDate = parseToDate(expiredDate);
    if (!parsedDate) {
        return (
            <Badge variant="secondary" className={cn("text-[9px]", className)}>
                {formatDate(expiredDate) || expiredDate}
            </Badge>
        );
    }

    const expTime = parsedDate.getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));

    // Expired
    if (diffDays <= 0) {
        return (
            <Badge
                variant="destructive"
                className={cn(
                    "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 gap-1 text-[9px] font-bold",
                    className
                )}
            >
                <IconX size={11} className="shrink-0" />
                <span>Kadaluarsa ({Math.abs(diffDays)}h lalu)</span>
                {showFullInfo && batchNumber && <span className="opacity-75">#{batchNumber}</span>}
            </Badge>
        );
    }

    // Critical: < 30 days
    if (diffDays <= EXPIRATION_THRESHOLDS.DANGER_DAYS) {
        return (
            <Badge
                variant="destructive"
                className={cn(
                    "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900 gap-1 text-[9px] font-bold animate-pulse",
                    className
                )}
            >
                <IconAlertTriangle size={11} className="shrink-0" />
                <span>Exp: {diffDays} hari lagi</span>
                {showFullInfo && batchNumber && <span className="opacity-75">#{batchNumber}</span>}
            </Badge>
        );
    }

    // Warning: 30 - 90 days
    if (diffDays <= EXPIRATION_THRESHOLDS.WARNING_DAYS) {
        return (
            <Badge
                variant="warning"
                className={cn(
                    "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-800 gap-1 text-[9px] font-bold",
                    className
                )}
            >
                <IconClock size={11} className="shrink-0" />
                <span>Exp: {diffDays} hari lagi</span>
                {showFullInfo && batchNumber && <span className="opacity-75">#{batchNumber}</span>}
            </Badge>
        );
    }

    // Safe: > 90 days
    return (
        <Badge
            variant="success"
            className={cn(
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 gap-1 text-[9px] font-semibold",
                className
            )}
        >
            <IconCheck size={11} className="shrink-0" />
            <span>Aman ({diffDays}h)</span>
            {showFullInfo && batchNumber && (
                <span className="opacity-75 font-mono">#{batchNumber}</span>
            )}
            {showFullInfo && stock !== undefined && (
                <span className="opacity-80">| Sisa: {stock}</span>
            )}
        </Badge>
    );
}
