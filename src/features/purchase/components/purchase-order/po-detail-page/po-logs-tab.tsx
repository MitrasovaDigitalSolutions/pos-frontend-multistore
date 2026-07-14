import type { ActivityLog } from "@/features/stock/api/stock-api";
import { formatToReadableDateTime } from "@/lib/date-utils";

interface POLogsTabProps {
    logs: ActivityLog[];
    logsLoading: boolean;
}

export function POLogsTab({ logs, logsLoading }: POLogsTabProps) {
    return (
        <div className="space-y-4 pl-3 py-1">
            {logs.map((log) => (
                <div key={log.uid} className="relative flex gap-3 pb-4 last:pb-0 border-l border-slate-100 pl-4">
                    <div className="absolute -left-1.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    <div className="space-y-0.5 text-xs">
                        <p className="font-semibold text-slate-800">
                            {log.description}
                        </p>
                        <div className="flex gap-2 text-[10px] text-slate-400 font-mono">
                            <span>
                                {formatToReadableDateTime(log.created_at)}
                            </span>
                            <span>•</span>
                            <span>Oleh: {log.user?.name || "System"}</span>
                        </div>
                    </div>
                </div>
            ))}
            {logs.length === 0 && !logsLoading && (
                <p className="text-center py-8 text-slate-400 text-xs">
                    Belum ada log aktivitas tercatat untuk Purchase Order ini.
                </p>
            )}
        </div>
    );
}
