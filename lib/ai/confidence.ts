// ============================================================================
// CONFIDENCE SCORING & AUTO-APPROVAL LOGIC
// ============================================================================

import { ExtractedInvoiceData } from './extractor';

export interface ConfidenceScoring {
  overall_score: number;
  field_scores: Record<string, number>;
  status: 'auto_approve' | 'review' | 'reject';
  reason: string;
}

/**
 * Calculate weighted confidence score for an invoice
 * 
 * Weighting Strategy:
 * - GSTIN: 20% (critical for tax registration)
 * - Total Amount: 30% (key financial data)
 * - GST Amount: 25% (crucial for tax calculation)
 * - HSN Code: 15% (classification)
 * - Vendor Name: 5% (informational)
 * - Invoice Number: 3% (reference)
 * - Invoice Date: 2% (timestamp)
 */
export function calculateConfidenceScore(extracted: ExtractedInvoiceData): ConfidenceScoring {
  const fieldScores = extracted.confidence_per_field;

  // Weight each field
  const weights = {
    vendor_gstin: 0.20,
    total_amount: 0.30,
    gst_amount: 0.25,
    hsn_code: 0.15,
    vendor_name: 0.05,
    invoice_number: 0.03,
    invoice_date: 0.02,
  };

  // Calculate weighted score
  const overallScore =
    (fieldScores.vendor_gstin * weights.vendor_gstin +
      fieldScores.total_amount * weights.total_amount +
      fieldScores.gst_amount * weights.gst_amount +
      fieldScores.hsn_code * weights.hsn_code +
      fieldScores.vendor_name * weights.vendor_name +
      fieldScores.invoice_number * weights.invoice_number +
      fieldScores.invoice_date * weights.invoice_date) /
    (weights.vendor_gstin +
      weights.total_amount +
      weights.gst_amount +
      weights.hsn_code +
      weights.vendor_name +
      weights.invoice_number +
      weights.invoice_date);

  // Determine status based on thresholds
  let status: 'auto_approve' | 'review' | 'reject' = 'review';
  let reason = 'Manual review required';

  if (overallScore >= 0.95) {
    status = 'auto_approve';
    reason = 'High confidence extraction (95%+)';
  } else if (overallScore < 0.80) {
    status = 'reject';
    reason = 'Low confidence extraction (<80%). Client clarification needed.';
  }

  // Additional checks for critical fields
  if (
    status !== 'reject' &&
    (fieldScores.vendor_gstin < 0.80 ||
      fieldScores.total_amount < 0.80 ||
      fieldScores.gst_amount < 0.80)
  ) {
    status = 'review';
    reason = 'Critical field(s) have low confidence - requires admin review';
  }

  return {
    overall_score: Math.round(overallScore * 100) / 100, // Round to 2 decimals
    field_scores: fieldScores,
    status,
    reason,
  };
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(score: number): string {
  if (score >= 0.95) return 'Very High';
  if (score >= 0.85) return 'High';
  if (score >= 0.75) return 'Medium';
  if (score >= 0.60) return 'Low';
  return 'Very Low';
}

/**
 * Get color for confidence score (for UI)
 */
export function getConfidenceColor(score: number): string {
  if (score >= 0.95) return '#10b981'; // Green
  if (score >= 0.85) return '#3b82f6'; // Blue
  if (score >= 0.75) return '#f59e0b'; // Amber
  if (score >= 0.60) return '#ef4444'; // Red
  return '#7f1d1d'; // Dark Red
}

/**
 * Detailed confidence assessment
 */
export function getDetailedAssessment(extracted: ExtractedInvoiceData): string {
  const scores = extracted.confidence_per_field;
  const issues: string[] = [];

  if (scores.vendor_gstin < 0.80) {
    issues.push('Vendor GSTIN confidence is low');
  }
  if (scores.total_amount < 0.80) {
    issues.push('Total amount extraction uncertain');
  }
  if (scores.gst_amount < 0.80) {
    issues.push('GST amount confidence is low');
  }
  if (scores.hsn_code < 0.80) {
    issues.push('HSN code could not be extracted clearly');
  }
  if (scores.invoice_date < 0.70) {
    issues.push('Invoice date may be incorrect');
  }

  if (issues.length === 0) {
    return 'All critical fields extracted with good confidence';
  }

  return issues.join('. ');
}
