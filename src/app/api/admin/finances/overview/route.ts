import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient();

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    // Build 6-month range
    const months: Array<{ start: string; end: string; label: string }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const s = new Date(d.getFullYear(), d.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
      months.push({
        start: s,
        end: e,
        label: d.toLocaleDateString("en-AU", { month: "short" }),
      });
    }

    const [
      invoicesRes,
      paidInvoicesRes,
      timeLogsRes,
      contractorsRes,
      projectsRes,
    ] = await Promise.all([
      // All invoices (for invoices tab)
      supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false }),

      // Paid invoices in last 6 months (for revenue chart)
      supabase
        .from("invoices")
        .select("amount, paid_at, status, created_at")
        .gte("created_at", months[0].start),

      // Time logs in last 6 months (for cost chart)
      supabase
        .from("time_logs")
        .select(`
          id, date, hours, project_id, contractor_id, billable,
          contractor:contractors(id, name, hourly_rate, currency)
        `)
        .gte("date", months[0].start),

      // All active contractors
      supabase
        .from("contractors")
        .select("id, name, hourly_rate, currency")
        .eq("status", "active"),

      // Projects with financials
      supabase
        .from("projects")
        .select("id, name, revenue, cost, margin_percent, status, client:clients(name)")
        .in("status", ["planning", "in_progress", "review"]),
    ]);

    const invoices = invoicesRes.data || [];
    const paidInvoices = paidInvoicesRes.data || [];
    const timeLogs = timeLogsRes.data || [];
    const contractors = contractorsRes.data || [];
    const projects = projectsRes.data || [];

    // Monthly revenue (paid invoices this month)
    const monthlyRevenue = paidInvoices
      .filter(
        (inv) =>
          inv.status === "paid" &&
          inv.paid_at &&
          inv.paid_at >= startOfMonth
      )
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

    // Monthly cost (time logs this month * hourly rates)
    const contractorRates: Record<string, number> = {};
    contractors.forEach((c) => {
      contractorRates[c.id] = Number(c.hourly_rate || 0);
    });

    const monthlyCost = timeLogs
      .filter((log) => log.date >= startOfMonth && log.date <= endOfMonth)
      .reduce((sum, log) => {
        const rate =
          contractorRates[log.contractor_id] ||
          Number(
            (log.contractor as { hourly_rate?: number } | null)?.hourly_rate || 0
          );
        return sum + Number(log.hours) * rate;
      }, 0);

    const netProfit = monthlyRevenue - monthlyCost;
    const margin =
      monthlyRevenue > 0 ? Math.round((netProfit / monthlyRevenue) * 100) : 0;

    // Chart data: revenue vs cost per month
    const chartData = months.map((m) => {
      const rev = paidInvoices
        .filter(
          (inv) =>
            inv.status === "paid" &&
            inv.paid_at &&
            inv.paid_at >= m.start &&
            inv.paid_at <= m.end + "T23:59:59"
        )
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

      const cost = timeLogs
        .filter((log) => log.date >= m.start && log.date <= m.end)
        .reduce((sum, log) => {
          const rate =
            contractorRates[log.contractor_id] ||
            Number(
              (log.contractor as { hourly_rate?: number } | null)
                ?.hourly_rate || 0
            );
          return sum + Number(log.hours) * rate;
        }, 0);

      return { label: m.label, revenue: Math.round(rev), cost: Math.round(cost) };
    });

    // Top clients by revenue (from projects)
    const clientRevenue: Record<string, { name: string; revenue: number }> = {};
    projects.forEach((p) => {
      const clientName =
        (p.client as unknown as { name: string } | null)?.name || "Unknown";
      if (!clientRevenue[clientName]) {
        clientRevenue[clientName] = { name: clientName, revenue: 0 };
      }
      clientRevenue[clientName].revenue += Number(p.revenue || 0);
    });
    const topClients = Object.values(clientRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Contractor costs this month
    const contractorCosts = contractors.map((c) => {
      const logs = timeLogs.filter(
        (log) =>
          log.contractor_id === c.id &&
          log.date >= startOfMonth &&
          log.date <= endOfMonth
      );
      const hours = logs.reduce((sum, log) => sum + Number(log.hours), 0);
      const total = hours * Number(c.hourly_rate || 0);
      return {
        id: c.id,
        name: c.name,
        hourly_rate: Number(c.hourly_rate),
        currency: c.currency,
        hours: Math.round(hours * 10) / 10,
        total: Math.round(total),
      };
    });

    // Per-project costs this month
    const projectCosts = projects.map((p) => {
      const logs = timeLogs.filter(
        (log) =>
          log.project_id === p.id &&
          log.date >= startOfMonth &&
          log.date <= endOfMonth
      );
      const hours = logs.reduce((sum, log) => sum + Number(log.hours), 0);
      const cost = logs.reduce((sum, log) => {
        const rate =
          contractorRates[log.contractor_id] ||
          Number(
            (log.contractor as { hourly_rate?: number } | null)
              ?.hourly_rate || 0
          );
        return sum + Number(log.hours) * rate;
      }, 0);
      return {
        id: p.id,
        name: p.name,
        hours: Math.round(hours * 10) / 10,
        cost: Math.round(cost),
        revenue: Number(p.revenue || 0),
      };
    });

    return NextResponse.json({
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyCost: Math.round(monthlyCost),
      netProfit: Math.round(netProfit),
      margin,
      chartData,
      topClients,
      invoices,
      contractorCosts,
      projectCosts,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
