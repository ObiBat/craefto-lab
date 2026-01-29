import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics/goals - Get all goals with current progress
 */
export async function GET() {
  const supabase = createServerClient();

  try {
    // Get all active goals
    const { data: goals, error } = await supabase
      .from("analytics_goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update current values for each goal
    const goalsWithProgress = await Promise.all(
      (goals || []).map(async (goal) => {
        let currentValue = goal.current_value;

        // Calculate current value based on goal type
        const startDate = goal.start_date ? new Date(goal.start_date) : getStartOfPeriod(goal.period);
        const endDate = goal.end_date ? new Date(goal.end_date) : new Date();

        switch (goal.goal_type) {
          case "lead_generation": {
            const { count } = await supabase
              .from("leads")
              .select("*", { count: "exact", head: true })
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString());
            currentValue = count || 0;
            break;
          }

          case "page_views": {
            const { count } = await supabase
              .from("page_views")
              .select("*", { count: "exact", head: true })
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString());
            currentValue = count || 0;
            break;
          }

          case "conversion": {
            // Calculate conversion rate
            const { count: views } = await supabase
              .from("page_views")
              .select("*", { count: "exact", head: true })
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString());

            const { count: leads } = await supabase
              .from("leads")
              .select("*", { count: "exact", head: true })
              .gte("created_at", startDate.toISOString())
              .lte("created_at", endDate.toISOString());

            currentValue = views ? Math.round(((leads || 0) / views) * 10000) : 0; // Store as basis points
            break;
          }

          case "engagement": {
            // Count article views
            const { count } = await supabase
              .from("article_views")
              .select("*", { count: "exact", head: true })
              .gte("view_date", startDate.toISOString().split("T")[0])
              .lte("view_date", endDate.toISOString().split("T")[0]);
            currentValue = count || 0;
            break;
          }
        }

        // Update the stored value
        if (currentValue !== goal.current_value) {
          await supabase
            .from("analytics_goals")
            .update({ 
              current_value: currentValue,
              updated_at: new Date().toISOString(),
            })
            .eq("id", goal.id);
        }

        const progress = Math.min(100, Math.round((currentValue / goal.target_value) * 100));
        const daysRemaining = goal.end_date 
          ? Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null;

        return {
          ...goal,
          current_value: currentValue,
          progress,
          daysRemaining,
          isOnTrack: progress >= getExpectedProgress(goal),
        };
      })
    );

    return NextResponse.json(goalsWithProgress);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/analytics/goals - Create or manage goals
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { action, goalId, ...goalData } = body;

    switch (action) {
      case "create": {
        const { data, error } = await supabase
          .from("analytics_goals")
          .insert({
            name: goalData.name,
            goal_type: goalData.goal_type,
            target_value: goalData.target_value,
            period: goalData.period || "monthly",
            start_date: goalData.start_date || new Date().toISOString().split("T")[0],
            end_date: goalData.end_date,
            status: "active",
            metadata: goalData.metadata || {},
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
      }

      case "update": {
        if (!goalId) {
          return NextResponse.json(
            { error: "goalId required for update" },
            { status: 400 }
          );
        }

        const updateFields: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        const allowedFields = ['name', 'target_value', 'period', 'start_date', 'end_date', 'status', 'metadata'];
        allowedFields.forEach(field => {
          if (goalData[field] !== undefined) {
            updateFields[field] = goalData[field];
          }
        });

        const { data, error } = await supabase
          .from("analytics_goals")
          .update(updateFields)
          .eq("id", goalId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
      }

      case "delete": {
        if (!goalId) {
          return NextResponse.json(
            { error: "goalId required for delete" },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from("analytics_goals")
          .delete()
          .eq("id", goalId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getStartOfPeriod(period: string): Date {
  const now = new Date();
  switch (period) {
    case "daily":
      now.setHours(0, 0, 0, 0);
      return now;
    case "weekly":
      now.setDate(now.getDate() - now.getDay());
      now.setHours(0, 0, 0, 0);
      return now;
    case "monthly":
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      return now;
    case "quarterly":
      now.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
      now.setHours(0, 0, 0, 0);
      return now;
    case "yearly":
      now.setMonth(0, 1);
      now.setHours(0, 0, 0, 0);
      return now;
    default:
      return now;
  }
}

function getExpectedProgress(goal: { start_date: string | null; end_date: string | null; period: string }): number {
  if (!goal.start_date || !goal.end_date) return 50; // Default to 50% expected if no dates

  const start = new Date(goal.start_date).getTime();
  const end = new Date(goal.end_date).getTime();
  const now = Date.now();

  const totalDuration = end - start;
  const elapsed = now - start;

  return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
}
