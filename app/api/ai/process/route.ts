// ============================================================================
// PROCESS API ENDPOINT - AI Pipeline Orchestration
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import {
  processInvoicePipeline,
  batchProcessInvoices,
  PipelineResult,
  PipelineConfig,
} from '@/lib/ai/orchestrator';

/**
 * POST /api/ai/process - Process invoice through complete AI pipeline
 * Request Body: {
 *   invoice_id: string,
 *   user_id: string,
 *   config?: PipelineConfig
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice_id, user_id, config } = body;

    // Validate required fields
    if (!invoice_id) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify invoice exists and user has access
    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('id, file_path, clients!inner(user_id)')
      .eq('id', invoice_id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const invoiceUserId = (invoice.clients as any)?.user_id;
    if (invoiceUserId !== user_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to invoice' },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!invoice.file_path) {
      return NextResponse.json(
        { success: false, error: 'Invoice file not found. Please upload the file first.' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting pipeline processing for invoice ${invoice_id}...`);

    // Process through pipeline
    const pipelineConfig: PipelineConfig = config || {};
    const result: PipelineResult = await processInvoicePipeline(
      invoice_id,
      user_id,
      pipelineConfig
    );

    console.log(
      `[API] Pipeline completed: status=${result.pipeline_status}, decision=${result.final_decision}`
    );

    // Return result
    return NextResponse.json({
      success: result.success,
      data: {
        invoice_id: result.invoice_id,
        pipeline_status: result.pipeline_status,
        aggregate_confidence: result.aggregate_confidence,
        final_decision: result.final_decision,
        final_status: result.final_status,
        stages: {
          extraction: {
            success: result.stages.extraction.success,
            confidence: result.stages.extraction.confidence,
            status: result.stages.extraction.status,
            duration_ms: result.stages.extraction.duration_ms,
          },
          categorization: {
            success: result.stages.categorization.success,
            confidence: result.stages.categorization.confidence,
            status: result.stages.categorization.status,
            duration_ms: result.stages.categorization.duration_ms,
          },
          validation: {
            success: result.stages.validation.success,
            confidence: result.stages.validation.confidence,
            status: result.stages.validation.status,
            duration_ms: result.stages.validation.duration_ms,
          },
          approval: {
            success: result.stages.approval.success,
            confidence: result.stages.approval.confidence,
            status: result.stages.approval.status,
            duration_ms: result.stages.approval.duration_ms,
          },
        },
        errors: result.errors,
        processing_time_ms: result.processing_time_ms,
      },
      message: getResultMessage(result),
    });
  } catch (error: any) {
    console.error('[API] Pipeline processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process invoice through pipeline',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/process/batch - Batch process multiple invoices
 * Request Body: {
 *   invoice_ids: string[],
 *   user_id: string,
 *   config?: PipelineConfig
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice_ids, user_id, config } = body;

    // Validate required fields
    if (!invoice_ids || !Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice IDs array is required' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Limit batch size
    if (invoice_ids.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 invoices can be processed in one batch' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting batch processing for ${invoice_ids.length} invoices...`);

    // Process batch
    const pipelineConfig: PipelineConfig = config || {};
    const results = await batchProcessInvoices(invoice_ids, user_id, pipelineConfig);

    // Calculate summary statistics
    const summary = {
      total: results.length,
      completed: results.filter((r) => r.pipeline_status === 'completed').length,
      partial: results.filter((r) => r.pipeline_status === 'partial').length,
      failed: results.filter((r) => r.pipeline_status === 'failed').length,
      auto_approved: results.filter((r) => r.final_decision === 'auto_approved').length,
      needs_review: results.filter((r) => r.final_decision === 'needs_review').length,
      rejected: results.filter((r) => r.final_decision === 'rejected').length,
      average_confidence:
        results.reduce((sum, r) => sum + r.aggregate_confidence, 0) / results.length,
      total_processing_time_ms: results.reduce((sum, r) => sum + r.processing_time_ms, 0),
    };

    console.log(`[API] Batch processing completed:`, summary);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        results: results.map((r) => ({
          invoice_id: r.invoice_id,
          success: r.success,
          pipeline_status: r.pipeline_status,
          aggregate_confidence: r.aggregate_confidence,
          final_decision: r.final_decision,
          final_status: r.final_status,
          errors: r.errors,
          processing_time_ms: r.processing_time_ms,
        })),
      },
    });
  } catch (error: any) {
    console.error('[API] Batch processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process batch',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/process?invoice_id=xxx&user_id=xxx - Get pipeline status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoice_id = searchParams.get('invoice_id');
    const user_id = searchParams.get('user_id');

    if (!invoice_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID and User ID are required' },
        { status: 400 }
      );
    }

    // Fetch invoice with all processing data
    const { data: invoice, error } = await adminClient
      .from('invoices')
      .select(
        `
        id,
        invoice_number,
        status,
        confidence_score,
        review_notes,
        file_path,
        extracted_data,
        approved_at,
        clients!inner(user_id)
      `
      )
      .eq('id', invoice_id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify user access
    const invoiceUserId = (invoice.clients as any)?.user_id;
    if (invoiceUserId !== user_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to invoice' },
        { status: 403 }
      );
    }

    // Get activity logs for this invoice
    const { data: activities } = await adminClient
      .from('activity_log')
      .select('action, new_values, created_at')
      .eq('entity_type', 'invoice')
      .eq('entity_id', invoice_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Parse extracted data to get stage info
    const extractedData = invoice.extracted_data as any || {};
    const hasExtraction = extractedData && Object.keys(extractedData).length > 0;
    const hasCategorization = extractedData?.categorization != null;

    // Get validation info from activities
    const validationActivity = activities?.find((a) => a.action === 'invoice_validated');
    const pipelineActivity = activities?.find((a) => a.action === 'invoice_pipeline_processed');

    return NextResponse.json({
      success: true,
      data: {
        invoice_id,
        invoice_number: invoice.invoice_number,
        current_status: invoice.status,
        confidence_score: invoice.confidence_score,
        has_file: !!invoice.file_path,
        pipeline_stages: {
          extraction: {
            completed: hasExtraction,
            confidence: extractedData?.overall_confidence || null,
          },
          categorization: {
            completed: hasCategorization,
            confidence: extractedData?.categorization?.confidence_score || null,
          },
          validation: {
            completed: !!validationActivity,
            confidence: validationActivity?.new_values?.confidence_score || null,
          },
          approval: {
            completed: invoice.status === 'approved',
            approved_at: invoice.approved_at,
          },
        },
        pipeline_result: pipelineActivity?.new_values || null,
        review_notes: invoice.review_notes,
        recent_activities: activities?.slice(0, 5) || [],
      },
    });
  } catch (error: any) {
    console.error('[API] Error fetching pipeline status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pipeline status' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getResultMessage(result: PipelineResult): string {
  if (!result.success) {
    return `Pipeline failed: ${result.errors[0]?.message || 'Unknown error'}`;
  }

  switch (result.final_decision) {
    case 'auto_approved':
      return `✓ Invoice auto-approved with ${(result.aggregate_confidence * 100).toFixed(0)}% confidence`;
    case 'needs_review':
      return `⚠ Invoice needs manual review (${(result.aggregate_confidence * 100).toFixed(0)}% confidence)`;
    case 'rejected':
      return `✗ Invoice requires corrections (${(result.aggregate_confidence * 100).toFixed(0)}% confidence)`;
    default:
      return `Invoice processed with ${(result.aggregate_confidence * 100).toFixed(0)}% confidence`;
  }
}
