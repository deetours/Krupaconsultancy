// ============================================================================
// API: Get invoices needing review (attention queue)
// GET /api/admin/attention-queue
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

interface AttentionItem {
  id: string;
  invoice_number: string;
  client_name: string;
  confidence_score: number;
  status: string;
  created_at: string;
  reason: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });
    }

    // Verify user is admin
    const { data: user } = await adminClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get invoices needing review (confidence 0.80-0.95)
    const { data: reviewQueue, error } = await adminClient
      .from('invoices')
      .select(
        `
        id,
        invoice_number,
        confidence_score,
        status,
        created_at,
        clients(business_name)
      `
      )
      .eq('status', 'review')
      .gte('confidence_score', 0.80)
      .lt('confidence_score', 0.95)
      .order('confidence_score', { ascending: true }); // Lowest confidence first

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get invoices with low confidence (<0.80) - for client clarification
    const { data: lowConfidence } = await adminClient
      .from('invoices')
      .select(
        `
        id,
        invoice_number,
        confidence_score,
        status,
        created_at,
        clients(business_name)
      `
      )
      .eq('status', 'rejected')
      .lt('confidence_score', 0.80)
      .order('created_at', { ascending: false });

    // Get invoices pending initial extraction
    const { data: pending } = await adminClient
      .from('invoices')
      .select(
        `
        id,
        invoice_number,
        confidence_score,
        status,
        created_at,
        clients(business_name)
      `
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    // Format response
    const attentionItems: AttentionItem[] = [
      ...(reviewQueue?.map((inv: any) => ({
        id: inv.id,
        invoice_number: inv.invoice_number || 'N/A',
        client_name: inv.clients?.business_name || 'Unknown',
        confidence_score: inv.confidence_score || 0,
        status: 'review',
        created_at: inv.created_at,
        reason: `Confidence: ${(inv.confidence_score * 100).toFixed(0)}% - Requires admin review`,
      })) || []),
      ...(lowConfidence?.map((inv: any) => ({
        id: inv.id,
        invoice_number: inv.invoice_number || 'N/A',
        client_name: inv.clients?.business_name || 'Unknown',
        confidence_score: inv.confidence_score || 0,
        status: 'rejected',
        created_at: inv.created_at,
        reason: `Low confidence: ${(inv.confidence_score * 100).toFixed(0)}% - Awaiting client clarification`,
      })) || []),
      ...(pending?.map((inv: any) => ({
        id: inv.id,
        invoice_number: inv.invoice_number || 'N/A',
        client_name: inv.clients?.business_name || 'Unknown',
        confidence_score: inv.confidence_score || 0,
        status: 'pending',
        created_at: inv.created_at,
        reason: 'Awaiting AI extraction',
      })) || []),
    ];

    return NextResponse.json({
      success: true,
      total: attentionItems.length,
      review_queue: reviewQueue?.length || 0,
      low_confidence: lowConfidence?.length || 0,
      pending: pending?.length || 0,
      items: attentionItems,
    });
  } catch (error) {
    console.error('[Attention Queue] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch attention queue' },
      { status: 500 }
    );
  }
}
