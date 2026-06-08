"use client";

import { useDashboardSummary } from "@/features/dashboard/api/dashboard-api";
import { StatsGrid } from "@/features/dashboard/components/stats-grid";
import { SalesChart } from "@/features/dashboard/components/sales-chart";
import { TopProducts } from "@/features/dashboard/components/top-products";
import { PageLoader } from "@/components/feedback/page-loader";

export default function AdminDashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary();

  if (isLoading) {
    return <PageLoader message="Memuat dashboard admin..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsGrid summary={summary} />

      {/* Charts & Top Products */}
      <section className="grid grid-cols-[1.4fr_1fr] gap-6">
        <SalesChart summary={summary} />
        <TopProducts summary={summary} />
      </section>
    </div>
  );
}
