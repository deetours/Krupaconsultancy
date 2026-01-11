// ============================================================================
// AI ORCHESTRATOR - Pipeline Management for Invoice Processing
// ============================================================================

import { adminClient } from '@/lib/supabase/admin';
import { extractInvoiceData } from './extractor';
import { categorizeInvoice } from './categorizer';
import { validateGSTInvoice } from './validator';
import { autoApproveInvoice } from './approval';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PipelineResult {
  invoice_id: string;
  success: boolean;
  pipeline_status: 'completed' | 'partial' | 'failed';
  stages: {
    extraction: StageResult;
    categorization: StageResult;
    validation: StageResult;
    approval: StageResult;
  };
  aggregate_confidence: number;
  final_decision: 'auto_approved' | 'needs_review' | 'rejected' | 'pending';
  final_status: string;
  errors: PipelineError[];
  processing_time_ms: number;
}

export interface StageResult {
  stage_name: string;
  success: boolean;
  confidence: number;
  status: string;
  data?: any;
  error?: string;
  duration_ms: number;
  timestamp: string;
}

export interface PipelineError {
  stage: string;
  error_type: string;
  message: string;
  recoverable: boolean;
  timestamp: string;
}

export interface PipelineConfig {
  skip_extraction?: boolean;
  skip_categorization?: boolean;
  skip_validation?: boolean;
  auto_approve_threshold?: number;
  review_threshold?: number;
  retry_on_error?: boolean;
  max_retries?: number;
}

// ============================================================================
// MAIN ORCHESTRATOR FUNCTION
// ============================================================================

/**
 * Process invoice through complete AI pipeline
 * Stages: Extract → Categorize → Validate → Decision
 */
export async function processInvoicePipeline(
  invoiceId: string,
  userId: string,
  config: PipelineConfig = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const errors: PipelineError[] = [];

  // Default configuration
  const {
    skip_extraction = false,
    skip_categorization = false,
    skip_validation = false,
    auto_approve_threshold = 0.95,
    review_threshold = 0.80,
    retry_on_error = true,
    max_retries = 2,
  } = config;

  // Initialize stage results
  const stages: PipelineResult['stages'] = {
    extraction: {
      stage_name: 'extraction',
      success: false,
      confidence: 0,
      status: 'pending',
      duration_ms: 0,
      timestamp: new Date().toISOString(),
    },
    categorization: {
      stage_name: 'categorization',
      success: false,
      confidence: 0,
      status: 'pending',
      duration_ms: 0,
      timestamp: new Date().toISOString(),
    },
    validation: {
      stage_name: 'validation',
      success: false,
      confidence: 0,
      status: 'pending',
      duration_ms: 0,
      timestamp: new Date().toISOString(),
    },
    approval: {
      stage_name: 'approval',
      success: false,
      confidence: 0,
      status: 'pending',
      duration_ms: 0,
      timestamp: new Date().toISOString(),
    },
  };

  try {
    // Fetch invoice with client info
    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('*, clients!inner(id, user_id, gstin)')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      throw new Error('Invoice not found');
    }

    // Verify user access
    const clientUserId = (invoice.clients as any)?.user_id;
    if (clientUserId !== userId) {
      throw new Error('Unauthorized access to invoice');
    }

    const clientId = invoice.client_id;

    // ========================================================================
    // STAGE 1: EXTRACTION
    // ========================================================================
    if (!skip_extraction) {
      const extractionStart = Date.now();
      try {
        console.log(`[Orchestrator] Stage 1: Extracting invoice ${invoiceId}...`);

        const extractionResult = await extractInvoiceData(invoice.file_path, invoiceId);

        stages.extraction = {
          stage_name: 'extraction',
          success: true,
          confidence: extractionResult.overall_confidence || 0,
          status: extractionResult.status || 'completed',
          data: extractionResult,
          duration_ms: Date.now() - extractionStart,
          timestamp: new Date().toISOString(),
        };

        console.log(
          `[Orchestrator] Extraction completed: confidence=${extractionResult.overall_confidence}`
        );
      } catch (error: any) {
        const errorMsg = error.message || 'Extraction failed';
        console.error('[Orchestrator] Extraction error:', errorMsg);

        stages.extraction = {
          stage_name: 'extraction',
          success: false,
          confidence: 0,
          status: 'failed',
          error: errorMsg,
          duration_ms: Date.now() - extractionStart,
          timestamp: new Date().toISOString(),
        };

        errors.push({
          stage: 'extraction',
          error_type: 'extraction_error',
          message: errorMsg,
          recoverable: false,
          timestamp: new Date().toISOString(),
        });

        // Extraction failure is critical - cannot proceed
        return buildFailureResult(invoiceId, stages, errors, startTime);
      }
    } else {
      stages.extraction.status = 'skipped';
      stages.extraction.success = true;
      stages.extraction.confidence = 1.0;
    }

    // ========================================================================
    // STAGE 2: CATEGORIZATION
    // ========================================================================
    if (!skip_categorization) {
      const categorizationStart = Date.now();
      try {
        console.log(`[Orchestrator] Stage 2: Categorizing invoice ${invoiceId}...`);

        // Get extracted HSN code
        const extractedData = invoice.extracted_data as any;
        const hsnCode = extractedData?.hsn_code || invoice.hsn_code;
        const amount = extractedData?.total_amount || invoice.total_amount;
        const description = extractedData?.description || invoice.invoice_number;

        const categorizationResult = await categorizeInvoice(hsnCode, amount, description);

        // Update invoice with categorization
        await adminClient
          .from('invoices')
          .update({
            extracted_data: {
              ...extractedData,
              categorization: categorizationResult,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId);

        stages.categorization = {
          stage_name: 'categorization',
          success: true,
          confidence: categorizationResult.confidence_score || 0,
          status: 'completed',
          data: categorizationResult,
          duration_ms: Date.now() - categorizationStart,
          timestamp: new Date().toISOString(),
        };

        console.log(
          `[Orchestrator] Categorization completed: confidence=${categorizationResult.confidence_score}`
        );
      } catch (error: any) {
        const errorMsg = error.message || 'Categorization failed';
        console.error('[Orchestrator] Categorization error:', errorMsg);

        stages.categorization = {
          stage_name: 'categorization',
          success: false,
          confidence: 0,
          status: 'failed',
          error: errorMsg,
          duration_ms: Date.now() - categorizationStart,
          timestamp: new Date().toISOString(),
        };

        errors.push({
          stage: 'categorization',
          error_type: 'categorization_error',
          message: errorMsg,
          recoverable: true,
          timestamp: new Date().toISOString(),
        });

        // Categorization failure is non-critical - can proceed with lower confidence
        console.log('[Orchestrator] Continuing despite categorization failure...');
      }
    } else {
      stages.categorization.status = 'skipped';
      stages.categorization.success = true;
      stages.categorization.confidence = 1.0;
    }

    // ========================================================================
    // STAGE 3: VALIDATION
    // ========================================================================
    if (!skip_validation) {
      const validationStart = Date.now();
      try {
        console.log(`[Orchestrator] Stage 3: Validating invoice ${invoiceId}...`);

        const validationResult = await validateGSTInvoice(invoiceId, clientId);

        stages.validation = {
          stage_name: 'validation',
          success: validationResult.is_valid,
          confidence: validationResult.overall_confidence,
          status: validationResult.status,
          data: validationResult,
          duration_ms: Date.now() - validationStart,
          timestamp: new Date().toISOString(),
        };

        console.log(
          `[Orchestrator] Validation completed: confidence=${validationResult.overall_confidence}, status=${validationResult.status}`
        );
      } catch (error: any) {
        const errorMsg = error.message || 'Validation failed';
        console.error('[Orchestrator] Validation error:', errorMsg);

        stages.validation = {
          stage_name: 'validation',
          success: false,
          confidence: 0,
          status: 'failed',
          error: errorMsg,
          duration_ms: Date.now() - validationStart,
          timestamp: new Date().toISOString(),
        };

        errors.push({
          stage: 'validation',
          error_type: 'validation_error',
          message: errorMsg,
          recoverable: true,
          timestamp: new Date().toISOString(),
        });

        // Validation failure is non-critical - proceed with caution
        console.log('[Orchestrator] Continuing despite validation failure...');
      }
    } else {
      stages.validation.status = 'skipped';
      stages.validation.success = true;
      stages.validation.confidence = 1.0;
    }

    // ========================================================================
    // STAGE 4: DECISION & APPROVAL
    // ========================================================================
    const approvalStart = Date.now();

    // Calculate aggregate confidence
    const aggregateConfidence = calculateAggregateConfidence(stages);

    console.log(`[Orchestrator] Aggregate confidence: ${aggregateConfidence}`);

    // Make decision
    let finalDecision: PipelineResult['final_decision'] = 'pending';
    let finalStatus = 'pending';

    if (aggregateConfidence >= auto_approve_threshold && stages.validation.success) {
      // Auto-approve: All checks passed with high confidence
      console.log('[Orchestrator] Stage 4: Auto-approving invoice...');

      try {
        await autoApproveInvoice(invoiceId, userId);

        finalDecision = 'auto_approved';
        finalStatus = 'approved';

        stages.approval = {
          stage_name: 'approval',
          success: true,
          confidence: aggregateConfidence,
          status: 'auto_approved',
          duration_ms: Date.now() - approvalStart,
          timestamp: new Date().toISOString(),
        };

        console.log('[Orchestrator] Invoice auto-approved successfully');
      } catch (error: any) {
        console.error('[Orchestrator] Auto-approval failed:', error.message);

        // Fallback to review queue
        finalDecision = 'needs_review';
        finalStatus = 'review';

        stages.approval = {
          stage_name: 'approval',
          success: false,
          confidence: aggregateConfidence,
          status: 'failed_approval',
          error: error.message,
          duration_ms: Date.now() - approvalStart,
          timestamp: new Date().toISOString(),
        };

        errors.push({
          stage: 'approval',
          error_type: 'approval_error',
          message: error.message,
          recoverable: true,
          timestamp: new Date().toISOString(),
        });
      }
    } else if (aggregateConfidence >= review_threshold) {
      // Manual review needed
      console.log('[Orchestrator] Invoice requires manual review');

      finalDecision = 'needs_review';
      finalStatus = 'review';

      await adminClient
        .from('invoices')
        .update({
          status: 'review',
          confidence_score: aggregateConfidence,
          review_notes: buildReviewNotes(stages, aggregateConfidence),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      stages.approval = {
        stage_name: 'approval',
        success: true,
        confidence: aggregateConfidence,
        status: 'review_required',
        duration_ms: Date.now() - approvalStart,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Reject: Low confidence or critical failures
      console.log('[Orchestrator] Invoice rejected due to low confidence');

      finalDecision = 'rejected';
      finalStatus = 'pending'; // Keep as pending, don't auto-reject

      await adminClient
        .from('invoices')
        .update({
          status: 'pending',
          confidence_score: aggregateConfidence,
          review_notes: buildReviewNotes(stages, aggregateConfidence, true),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      stages.approval = {
        stage_name: 'approval',
        success: false,
        confidence: aggregateConfidence,
        status: 'low_confidence',
        duration_ms: Date.now() - approvalStart,
        timestamp: new Date().toISOString(),
      };
    }

    // ========================================================================
    // LOG PIPELINE ACTIVITY
    // ========================================================================
    await logPipelineActivity(invoiceId, userId, clientId, stages, aggregateConfidence, finalDecision);

    // ========================================================================
    // RETURN RESULT
    // ========================================================================
    const processingTime = Date.now() - startTime;

    return {
      invoice_id: invoiceId,
      success: true,
      pipeline_status: errors.length === 0 ? 'completed' : 'partial',
      stages,
      aggregate_confidence: aggregateConfidence,
      final_decision: finalDecision,
      final_status: finalStatus,
      errors,
      processing_time_ms: processingTime,
    };
  } catch (error: any) {
    console.error('[Orchestrator] Pipeline error:', error);

    errors.push({
      stage: 'orchestrator',
      error_type: 'pipeline_error',
      message: error.message || 'Pipeline execution failed',
      recoverable: false,
      timestamp: new Date().toISOString(),
    });

    return buildFailureResult(invoiceId, stages, errors, startTime);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate aggregate confidence from all stages
 */
function calculateAggregateConfidence(stages: PipelineResult['stages']): number {
  const weights = {
    extraction: 0.40, // Most critical
    categorization: 0.20,
    validation: 0.40, // Very important
  };

  let aggregateConfidence =
    stages.extraction.confidence * weights.extraction +
    stages.categorization.confidence * weights.categorization +
    stages.validation.confidence * weights.validation;

  // Apply penalties for failures
  if (!stages.extraction.success) {
    aggregateConfidence = 0; // Critical failure
  }

  if (!stages.validation.success) {
    aggregateConfidence = Math.min(aggregateConfidence, 0.79); // Cap at review threshold
  }

  if (!stages.categorization.success) {
    aggregateConfidence *= 0.90; // 10% penalty
  }

  return Math.round(aggregateConfidence * 100) / 100;
}

/**
 * Build review notes from stage results
 */
function buildReviewNotes(
  stages: PipelineResult['stages'],
  aggregateConfidence: number,
  isRejected: boolean = false
): string {
  let notes = `Pipeline Processing Summary\n`;
  notes += `Overall Confidence: ${(aggregateConfidence * 100).toFixed(0)}%\n\n`;

  if (isRejected) {
    notes += `❌ REJECTED: Low confidence or critical failures detected\n\n`;
  } else {
    notes += `⚠️ MANUAL REVIEW REQUIRED\n\n`;
  }

  notes += `Stage Results:\n`;

  // Extraction
  if (stages.extraction.success) {
    notes += `✓ Extraction: ${(stages.extraction.confidence * 100).toFixed(0)}% confidence\n`;
  } else {
    notes += `✗ Extraction: FAILED - ${stages.extraction.error}\n`;
  }

  // Categorization
  if (stages.categorization.status === 'skipped') {
    notes += `- Categorization: Skipped\n`;
  } else if (stages.categorization.success) {
    notes += `✓ Categorization: ${(stages.categorization.confidence * 100).toFixed(0)}% confidence\n`;
    if (stages.categorization.data) {
      const catData = stages.categorization.data;
      notes += `  Category: ${catData.category}, GST Rate: ${catData.gst_rate}%\n`;
    }
  } else {
    notes += `✗ Categorization: FAILED - ${stages.categorization.error}\n`;
  }

  // Validation
  if (stages.validation.status === 'skipped') {
    notes += `- Validation: Skipped\n`;
  } else if (stages.validation.success) {
    notes += `✓ Validation: ${(stages.validation.confidence * 100).toFixed(0)}% confidence\n`;
    if (stages.validation.data?.violations?.length > 0) {
      notes += `  Warnings: ${stages.validation.data.violations.length} validation issues\n`;
    }
  } else {
    notes += `✗ Validation: FAILED - ${stages.validation.error}\n`;
  }

  notes += `\n`;

  if (isRejected) {
    notes += `Action Required: Please review and correct the errors above before reprocessing.\n`;
  } else {
    notes += `Action Required: Admin review and approval needed.\n`;
  }

  return notes;
}

/**
 * Build failure result
 */
function buildFailureResult(
  invoiceId: string,
  stages: PipelineResult['stages'],
  errors: PipelineError[],
  startTime: number
): PipelineResult {
  return {
    invoice_id: invoiceId,
    success: false,
    pipeline_status: 'failed',
    stages,
    aggregate_confidence: 0,
    final_decision: 'rejected',
    final_status: 'pending',
    errors,
    processing_time_ms: Date.now() - startTime,
  };
}

/**
 * Log pipeline activity
 */
async function logPipelineActivity(
  invoiceId: string,
  userId: string,
  clientId: string,
  stages: PipelineResult['stages'],
  aggregateConfidence: number,
  finalDecision: string
): Promise<void> {
  try {
    await adminClient.from('activity_log').insert({
      user_id: userId,
      client_id: clientId,
      action: 'invoice_pipeline_processed',
      entity_type: 'invoice',
      entity_id: invoiceId,
      new_values: {
        aggregate_confidence: aggregateConfidence,
        final_decision: finalDecision,
        extraction_confidence: stages.extraction.confidence,
        categorization_confidence: stages.categorization.confidence,
        validation_confidence: stages.validation.confidence,
        extraction_status: stages.extraction.status,
        categorization_status: stages.categorization.status,
        validation_status: stages.validation.status,
      },
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Orchestrator] Failed to log activity:', error);
  }
}

/**
 * Batch process multiple invoices
 */
export async function batchProcessInvoices(
  invoiceIds: string[],
  userId: string,
  config: PipelineConfig = {}
): Promise<PipelineResult[]> {
  console.log(`[Orchestrator] Batch processing ${invoiceIds.length} invoices...`);

  const results: PipelineResult[] = [];

  for (const invoiceId of invoiceIds) {
    try {
      const result = await processInvoicePipeline(invoiceId, userId, config);
      results.push(result);
    } catch (error: any) {
      console.error(`[Orchestrator] Failed to process invoice ${invoiceId}:`, error);

      results.push({
        invoice_id: invoiceId,
        success: false,
        pipeline_status: 'failed',
        stages: {} as any,
        aggregate_confidence: 0,
        final_decision: 'rejected',
        final_status: 'pending',
        errors: [
          {
            stage: 'orchestrator',
            error_type: 'pipeline_error',
            message: error.message,
            recoverable: false,
            timestamp: new Date().toISOString(),
          },
        ],
        processing_time_ms: 0,
      });
    }
  }

  console.log(`[Orchestrator] Batch processing completed: ${results.length} results`);

  return results;
}

/**
 * Get pipeline status label for UI
 */
export function getPipelineStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'Completed',
    partial: 'Partially Completed',
    failed: 'Failed',
  };

  return labels[status] || status;
}

/**
 * Get decision color for UI
 */
export function getDecisionColor(decision: string): string {
  const colors: Record<string, string> = {
    auto_approved: '#10b981', // Green
    needs_review: '#f59e0b', // Amber
    rejected: '#ef4444', // Red
    pending: '#6b7280', // Gray
  };

  return colors[decision] || '#6b7280';
}
