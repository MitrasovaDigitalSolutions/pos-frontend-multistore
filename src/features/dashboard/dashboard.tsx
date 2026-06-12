"use client";

import { useState } from "react";
import { useDashboardSummary, useSalesHistory } from "@/features/dashboard/api/dashboard-api";
import { StatMiniCards } from "@/features/dashboard/components/stat-mini-cards";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { SalesStatistics } from "@/features/dashboard/components/sales-statistics";
import { RecentOrdersTable } from "@/features/dashboard/components/recent-orders-table";
import { TopSellingWeekly } from "@/features/dashboard/components/top-selling-weekly";
import { PageLoader } from "@/components/feedback/page-loader";

export function Dashboard() {
  const [from] = useState<string>("");
  const [to] = useState<string>("");
  const [paymentMethod] = useState<string>("");

  const { data: summary, isLoading } = useDashboardSummary({
    from: from || undefined,
    to: to || undefined,
    payment_method: paymentMethod || undefined,
  });

  const { data: history } = useSalesHistory({
    from: from || undefined,
    to: to || undefined,
  });

  if (isLoading) {
    return <PageLoader message="Memuat dashboard admin..." />;
  }

  return (
    <div>
      <section className="grid gap-4 mb-4" style={{ gridTemplateColumns: "220px 1fr 280px" }}>
        <StatMiniCards summary={summary} />

        <RevenueChart summary={summary} history={history} />

        <SalesStatistics summary={summary} />
      </section>

      <section className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>
        <RecentOrdersTable
          from={from}
          to={to}
          paymentMethod={paymentMethod}
        />
        <TopSellingWeekly summary={summary} />
      </section>
    </div>
  );
}
