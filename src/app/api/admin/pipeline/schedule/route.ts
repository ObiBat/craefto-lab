import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pipeline/schedule - Get all scheduled scans
 */
export async function GET() {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("pipeline_schedules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/pipeline/schedule - Create or update a schedule
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { action, scheduleId, ...scheduleData } = body;

    switch (action) {
      case "create": {
        // Calculate next run time
        const nextRun = calculateNextRun(
          scheduleData.schedule_type,
          scheduleData.day_of_week,
          scheduleData.hour
        );

        const { data, error } = await supabase
          .from("pipeline_schedules")
          .insert({
            name: scheduleData.name,
            schedule_type: scheduleData.schedule_type,
            day_of_week: scheduleData.day_of_week,
            hour: scheduleData.hour ?? 9,
            enabled: scheduleData.enabled ?? true,
            topics: scheduleData.topics || [],
            config: scheduleData.config || {},
            next_run_at: nextRun,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
      }

      case "update": {
        if (!scheduleId) {
          return NextResponse.json(
            { error: "scheduleId required for update" },
            { status: 400 }
          );
        }

        const updateFields: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };

        const allowedFields = ['name', 'schedule_type', 'day_of_week', 'hour', 'enabled', 'topics', 'config'];
        allowedFields.forEach(field => {
          if (scheduleData[field] !== undefined) {
            updateFields[field] = scheduleData[field];
          }
        });

        // Recalculate next run if schedule changed
        if (scheduleData.schedule_type || scheduleData.day_of_week || scheduleData.hour) {
          const { data: current } = await supabase
            .from("pipeline_schedules")
            .select("schedule_type, day_of_week, hour")
            .eq("id", scheduleId)
            .single();

          if (current) {
            updateFields.next_run_at = calculateNextRun(
              scheduleData.schedule_type ?? current.schedule_type,
              scheduleData.day_of_week ?? current.day_of_week,
              scheduleData.hour ?? current.hour
            );
          }
        }

        const { data, error } = await supabase
          .from("pipeline_schedules")
          .update(updateFields)
          .eq("id", scheduleId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
      }

      case "toggle": {
        if (!scheduleId) {
          return NextResponse.json(
            { error: "scheduleId required for toggle" },
            { status: 400 }
          );
        }

        const { data: current } = await supabase
          .from("pipeline_schedules")
          .select("enabled")
          .eq("id", scheduleId)
          .single();

        const { data, error } = await supabase
          .from("pipeline_schedules")
          .update({ 
            enabled: !current?.enabled,
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduleId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
      }

      case "delete": {
        if (!scheduleId) {
          return NextResponse.json(
            { error: "scheduleId required for delete" },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from("pipeline_schedules")
          .delete()
          .eq("id", scheduleId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      case "run_now": {
        // Trigger an immediate scan for the schedule
        if (!scheduleId) {
          return NextResponse.json(
            { error: "scheduleId required for run_now" },
            { status: 400 }
          );
        }

        // Get schedule details
        const { data: schedule } = await supabase
          .from("pipeline_schedules")
          .select("topics")
          .eq("id", scheduleId)
          .single();

        // Trigger the scan
        const scanRes = await fetch(new URL("/api/admin/pipeline/insights", request.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "scan",
            topics: schedule?.topics,
          }),
        });

        const scanResult = await scanRes.json();

        // Update last run time
        const nextRun = calculateNextRun(
          scheduleData.schedule_type || 'weekly',
          scheduleData.day_of_week || 1,
          scheduleData.hour || 9
        );

        await supabase
          .from("pipeline_schedules")
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: nextRun,
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduleId);

        return NextResponse.json({
          success: true,
          insights: scanResult.insights?.length || 0,
        });
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

function calculateNextRun(
  scheduleType: string,
  dayOfWeek: number | null,
  hour: number
): string {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);

  switch (scheduleType) {
    case "daily":
      if (now.getHours() >= hour) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case "weekly":
      const currentDay = now.getDay();
      const targetDay = dayOfWeek ?? 1; // Default Monday
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0 || (daysUntil === 0 && now.getHours() >= hour)) {
        daysUntil += 7;
      }
      next.setDate(next.getDate() + daysUntil);
      break;

    case "biweekly":
      const currentDay2 = now.getDay();
      const targetDay2 = dayOfWeek ?? 1;
      let daysUntil2 = targetDay2 - currentDay2;
      if (daysUntil2 <= 0 || (daysUntil2 === 0 && now.getHours() >= hour)) {
        daysUntil2 += 14;
      }
      next.setDate(next.getDate() + daysUntil2);
      break;

    case "monthly":
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      break;
  }

  return next.toISOString();
}
