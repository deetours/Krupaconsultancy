// ============================================================================
// API: Extract invoice data using OpenRouter AI
// POST /api/ai/extract
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { extractInvoiceData } from '@/lib/ai/extractor';
import { calculateConfidenceScore } from '@/lib/ai/confidence';
import { autoApproveInvoice } from '@/lib/ai/approval';
import { adminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/helpers';

export const runtime = 'nodejs';

interface ExtractRequest {
  invoiceId: string;
  fileBase64: string;
  fileName: string;
  userId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ExtractRequest = await request.json();
    const { invoiceId, fileBase64, fileName, userId } = body;

    // Validate inputs
    if (!invoiceId || !fileBase64 || !fileName || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: invoiceId, fileBase64, fileName, userId' },
        { status: 400 }
      );
    }

    // Get invoice to verify ownership
    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Verify user owns the client
    const { data: client } = await adminClient
      .from('clients')
      .select('user_id')
      .eq('id', invoice.client_id)
      .single();

    if (client?.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log(`[AI Extract] Processing invoice ${invoiceId}...`);

    // Extract data from invoice
    const extracted = await extractInvoiceData(fileBase64, fileName);

    // Calculate confidence score
    const confidence = calculateConfidenceScore(extracted);

    // Update invoice with extracted data
    const { error: updateError } = await adminClient
      .from('invoices')
      .update({
        extracted_data: extracted,
        confidence_score: confidence.overall_score,
        status: confidence.status === 'reject' ? 'rejected' : 'review',
        review_notes:
          confidence.status === 'reject'
            ? confidence.reason
            : `AI Confidence: ${confidence.overall_score.toFixed(2)} - ${confidence.reason}`,
      })
      .eq('id', invoiceId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    // Auto-approve if confidence is high enough
    if (confidence.status === 'auto_approve') {
      console.log(`[AI Extract] Auto-approving invoice ${invoiceId} (${confidence.overall_score})`);
      await autoApproveInvoice(invoiceId, 'ai_system');
    }

    // Log extraction activity
    await logActivity(
      userId,
      invoice.client_id,
      'invoice_extracted',
      'invoice',
      invoiceId,
      {},
      {
        confidence_score: confidence.overall_score,
        status: confidence.status,
        extracted_fields: Object.keys(extracted).filter(k => !k.startsWith('confidence')),
      }
    );

    // Store field-level confidence
    const confidenceRecords = Object.entries(extracted.confidence_per_field).map(([field, score]) => ({
      invoice_id: invoiceId,
      field_name: field,
      confidence_score: score,
      extracted_value:
        extracted[field as keyof typeof extracted]?.toString() || null,
    }));

    await adminClient.from('extraction_confidence').insert(confidenceRecords);

    return NextResponse.json({
      success: true,
      invoiceId,
      extracted,
      confidence,
      status: confidence.status,
      message: confidence.reason,
    });
  } catch (error) {
    console.error('[AI Extract] Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('OpenRouter')) {
      return NextResponse.json(
        { error: `OpenRouter Error: ${error.message}` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Extraction failed' },
      { status: 500 }
    );
  }
}
