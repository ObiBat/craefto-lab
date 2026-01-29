import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/clients - Get all clients with their projects summary
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    let query = supabase
      .from("clients")
      .select(`
        *,
        projects:projects(
          id,
          name,
          status,
          health,
          progress,
          budget,
          spent
        ),
        invoices:invoices(
          id,
          amount,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate summary stats for each client
    const clientsWithStats = data?.map(client => {
      const projects = client.projects || [];
      const invoices = client.invoices || [];
      
      const activeProjects = projects.filter((p: { status: string }) => 
        p.status === 'in_progress' || p.status === 'planning'
      ).length;
      
      const totalBudget = projects.reduce((sum: number, p: { budget: number | null }) => 
        sum + (p.budget || 0), 0
      );
      
      const totalSpent = projects.reduce((sum: number, p: { spent: number | null }) => 
        sum + (p.spent || 0), 0
      );
      
      const paidInvoices = invoices.filter((i: { status: string }) => i.status === 'paid');
      const pendingInvoices = invoices.filter((i: { status: string }) => 
        i.status === 'sent' || i.status === 'viewed' || i.status === 'overdue'
      );
      
      const totalPaid = paidInvoices.reduce((sum: number, i: { amount: number }) => 
        sum + i.amount, 0
      );
      const totalPending = pendingInvoices.reduce((sum: number, i: { amount: number }) => 
        sum + i.amount, 0
      );

      // Determine overall health based on projects
      let overallHealth = 'on_track';
      const projectHealths = projects.map((p: { health: string }) => p.health);
      if (projectHealths.includes('blocked')) overallHealth = 'blocked';
      else if (projectHealths.includes('delayed')) overallHealth = 'delayed';
      else if (projectHealths.includes('at_risk')) overallHealth = 'at_risk';

      return {
        ...client,
        stats: {
          activeProjects,
          totalProjects: projects.length,
          totalBudget,
          totalSpent,
          totalPaid,
          totalPending,
          overallHealth
        }
      };
    });

    return NextResponse.json(clientsWithStats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/clients - Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: body.name,
        company: body.company,
        email: body.email,
        phone: body.phone,
        website: body.website,
        industry: body.industry,
        notes: body.notes,
        status: body.status || 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
