import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient();

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Run all queries in parallel
    const [
      invoicesRes,
      activeProjectsRes,
      contractorsRes,
      timeLogsRes,
      projectsWithMarginRes,
      recentTimeLogsRes,
      upcomingMilestonesRes,
      activeProjectsListRes,
    ] = await Promise.all([
      // Monthly revenue: sum of paid invoices this month
      supabase
        .from("invoices")
        .select("amount")
        .eq("status", "paid")
        .gte("paid_at", startOfMonth),

      // Active projects count
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .in("status", ["planning", "in_progress", "review"]),

      // Active contractors with capacity
      supabase
        .from("contractors")
        .select("id, capacity_hours_weekly")
        .eq("status", "active"),

      // Time logs this week (for utilization calc)
      supabase
        .from("time_logs")
        .select("contractor_id, hours")
        .gte("date", getWeekStart()),

      // Projects with margin data
      supabase
        .from("projects")
        .select("margin_percent")
        .in("status", ["planning", "in_progress", "review"])
        .gt("revenue", 0),

      // Recent time logs with joins
      supabase
        .from("time_logs")
        .select(`
          id, date, hours, description,
          contractor:contractors(id, name, avatar_url),
          project:projects(id, name)
        `)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10),

      // Upcoming milestones (next 14 days)
      supabase
        .from("milestones")
        .select(`
          id, name, due_date, status,
          project:projects(id, name, client:clients(name))
        `)
        .lte("due_date", twoWeeksFromNow)
        .gte("due_date", now.toISOString().split("T")[0])
        .in("status", ["pending", "in_progress"])
        .order("due_date", { ascending: true })
        .limit(10),

      // Active projects with details
      supabase
        .from("projects")
        .select(`
          id, name, status, health, progress, priority,
          client:clients(id, name),
          assignments:project_assignments(
            contractor:contractors(id, name, avatar_url)
          )
        `)
        .in("status", ["planning", "in_progress", "review"])
        .order("updated_at", { ascending: false })
        .limit(8),
    ]);

    // Calculate monthly revenue
    const monthlyRevenue = (invoicesRes.data || []).reduce(
      (sum, inv) => sum + Number(inv.amount || 0),
      0
    );

    // Active projects count
    const activeProjectsCount = activeProjectsRes.count || 0;

    // Team utilization
    const contractors = contractorsRes.data || [];
    const weeklyLogs = timeLogsRes.data || [];
    let utilization = 0;
    if (contractors.length > 0) {
      const hoursPerContractor: Record<string, number> = {};
      weeklyLogs.forEach((log) => {
        hoursPerContractor[log.contractor_id] =
          (hoursPerContractor[log.contractor_id] || 0) + Number(log.hours);
      });
      const totalCapacity = contractors.reduce(
        (sum, c) => sum + (c.capacity_hours_weekly || 40),
        0
      );
      const totalLogged = Object.values(hoursPerContractor).reduce(
        (sum, h) => sum + h,
        0
      );
      utilization = totalCapacity > 0 ? Math.round((totalLogged / totalCapacity) * 100) : 0;
    }

    // Average margin
    const marginProjects = projectsWithMarginRes.data || [];
    const avgMargin =
      marginProjects.length > 0
        ? Math.round(
            marginProjects.reduce((sum, p) => sum + Number(p.margin_percent || 0), 0) /
              marginProjects.length
          )
        : 0;

    return NextResponse.json({
      monthlyRevenue,
      activeProjectsCount,
      teamUtilization: utilization,
      avgMargin,
      recentTimeLogs: recentTimeLogsRes.data || [],
      upcomingMilestones: upcomingMilestonesRes.data || [],
      activeProjects: activeProjectsListRes.data || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}
