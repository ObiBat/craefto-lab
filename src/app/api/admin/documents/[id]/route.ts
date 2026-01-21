import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Document, UpdateDocumentRequest } from '@/lib/documents/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/documents/[id] - Get single document with relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        lead:leads(id, name, email, company, phone, service_interest, budget_range, timeline, message, score),
        signatures:document_signatures(*),
        invoice:invoices(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      console.error('Error fetching document:', error);
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }

    // Fetch activities separately (last 50)
    const { data: activities } = await supabase
      .from('document_activities')
      .select('*')
      .eq('document_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch versions
    const { data: versions } = await supabase
      .from('document_versions')
      .select('id, version_number, changed_by, change_summary, created_at')
      .eq('document_id', id)
      .order('version_number', { ascending: false });

    return NextResponse.json({
      document: {
        ...document,
        activities: activities || [],
        versions: versions || [],
      } as Document,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/documents/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/documents/[id] - Update document
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateDocumentRequest = await request.json();

    // Get current document for comparison
    const { data: currentDoc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    const changes: string[] = [];

    if (body.title !== undefined && body.title !== currentDoc.title) {
      updates.title = body.title;
      changes.push('title');
    }

    if (body.status !== undefined && body.status !== currentDoc.status) {
      updates.status = body.status;
      changes.push(`status: ${currentDoc.status} → ${body.status}`);
    }

    if (body.html_content !== undefined) {
      updates.html_content = body.html_content;
    }

    if (body.content_json !== undefined) {
      // Merge with existing content
      updates.content_json = {
        ...(currentDoc.content_json as object),
        ...body.content_json,
      };
      changes.push('content');

      // Create version snapshot before updating
      const { data: latestVersion } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const newVersionNumber = (latestVersion?.version_number || 0) + 1;

      await supabase.from('document_versions').insert({
        document_id: id,
        version_number: newVersionNumber,
        content_json: currentDoc.content_json,
        html_content: currentDoc.html_content,
        changed_by: 'admin',
        change_summary: changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Content updated',
      });
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ document: currentDoc });
    }

    // Update document
    const { data: document, error: updateError } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        lead:leads(id, name, email, company),
        signatures:document_signatures(*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating document:', updateError);
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    // Log activity
    const activityType = body.content_json ? 'content_edited' : 'updated';
    await supabase.from('document_activities').insert({
      document_id: id,
      activity_type: body.status !== currentDoc.status ? 'status_changed' : activityType,
      actor: 'admin',
      description: changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Document updated',
      previous_value: body.status !== currentDoc.status ? { status: currentDoc.status } : null,
      new_value: body.status !== currentDoc.status ? { status: body.status } : null,
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error in PATCH /api/admin/documents/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/documents/[id] - Archive document (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete - set status to archived
    const { data: document, error } = await supabase
      .from('documents')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      console.error('Error archiving document:', error);
      return NextResponse.json({ error: 'Failed to archive document' }, { status: 500 });
    }

    // Log activity
    await supabase.from('document_activities').insert({
      document_id: id,
      activity_type: 'archived',
      actor: 'admin',
      description: 'Document archived',
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Error in DELETE /api/admin/documents/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
