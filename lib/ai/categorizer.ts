// ============================================================================
// AI CATEGORIZATION AGENT - HSN Code to Tax Rate Mapping
// ============================================================================

import { adminClient } from '@/lib/supabase/admin';

export interface CategorizationResult {
  hsn_code: string | null;
  category: string | null;
  description: string | null;
  gst_rate: number | null;
  is_exempt: boolean;
  exemption_reason: string | null;
  confidence_score: number; // 0-1 (how confident are we in this categorization)
  match_type: 'exact' | 'partial' | 'default' | 'unknown';
  fallback_used: boolean;
}

export interface CategorizationScoring {
  overall_score: number;
  categorization_confidence: number;
  hsn_validity: number;
  tax_rate_confidence: number;
  status: 'categorized' | 'needs_review' | 'unknown';
  reason: string;
}

/**
 * Categorize invoice by HSN code and determine applicable GST rate
 * @param hsnCode - HSN/SAC code extracted from invoice
 * @param amount - Invoice amount for tax calculation
 * @param description - Optional product/service description
 * @returns Categorization result with tax rate and confidence
 */
export async function categorizeInvoice(
  hsnCode: string | null,
  amount: number | null,
  description?: string | null
): Promise<CategorizationResult> {
  // If no HSN code provided, return unknown with low confidence
  if (!hsnCode || hsnCode.trim() === '') {
    return {
      hsn_code: null,
      category: 'Unknown',
      description: 'No HSN code provided',
      gst_rate: 18.0, // Default to 18% as most common rate
      is_exempt: false,
      exemption_reason: null,
      confidence_score: 0.3, // Low confidence for default
      match_type: 'default',
      fallback_used: true,
    };
  }

  // Normalize HSN code (remove spaces, convert to uppercase)
  const normalizedHSN = hsnCode.trim().replace(/\s/g, '').toUpperCase();

  try {
    // 1. Try exact match first
    const exactMatch = await findExactHSNMatch(normalizedHSN);
    if (exactMatch) {
      return {
        hsn_code: exactMatch.hsn_code,
        category: exactMatch.category,
        description: exactMatch.description,
        gst_rate: exactMatch.gst_rate,
        is_exempt: exactMatch.is_exempt,
        exemption_reason: exactMatch.exemption_reason,
        confidence_score: 0.95, // High confidence for exact match
        match_type: 'exact',
        fallback_used: false,
      };
    }

    // 2. Try partial match (first 4 digits of HSN)
    if (normalizedHSN.length >= 4) {
      const partialMatch = await findPartialHSNMatch(normalizedHSN.substring(0, 4));
      if (partialMatch) {
        return {
          hsn_code: normalizedHSN,
          category: partialMatch.category,
          description: `Similar to: ${partialMatch.description}`,
          gst_rate: partialMatch.gst_rate,
          is_exempt: partialMatch.is_exempt,
          exemption_reason: partialMatch.exemption_reason,
          confidence_score: 0.75, // Medium confidence for partial match
          match_type: 'partial',
          fallback_used: false,
        };
      }
    }

    // 3. Try description-based matching if provided
    if (description) {
      const descriptionMatch = await findByDescription(description);
      if (descriptionMatch) {
        return {
          hsn_code: normalizedHSN,
          category: descriptionMatch.category,
          description: `Matched by description: ${descriptionMatch.description}`,
          gst_rate: descriptionMatch.gst_rate,
          is_exempt: descriptionMatch.is_exempt,
          exemption_reason: descriptionMatch.exemption_reason,
          confidence_score: 0.60, // Lower confidence for description match
          match_type: 'partial',
          fallback_used: false,
        };
      }
    }

    // 4. Fallback to default 18% (most common GST rate)
    return {
      hsn_code: normalizedHSN,
      category: 'Unclassified',
      description: 'HSN code not found in database - using default rate',
      gst_rate: 18.0,
      is_exempt: false,
      exemption_reason: null,
      confidence_score: 0.40, // Low confidence for unknown HSN
      match_type: 'default',
      fallback_used: true,
    };
  } catch (error) {
    console.error('Error categorizing invoice:', error);
    
    // Return safe default on error
    return {
      hsn_code: normalizedHSN,
      category: 'Error',
      description: 'Categorization error - using default rate',
      gst_rate: 18.0,
      is_exempt: false,
      exemption_reason: null,
      confidence_score: 0.30,
      match_type: 'default',
      fallback_used: true,
    };
  }
}

/**
 * Find exact HSN match in database
 */
async function findExactHSNMatch(hsnCode: string) {
  try {
    const { data, error } = await adminClient
      .from('hsn_tax_mapping')
      .select('*')
      .eq('hsn_code', hsnCode)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Find partial HSN match (first 4 digits)
 */
async function findPartialHSNMatch(hsnPrefix: string) {
  try {
    const { data, error } = await adminClient
      .from('hsn_tax_mapping')
      .select('*')
      .ilike('hsn_code', `${hsnPrefix}%`)
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Find HSN by description keyword matching
 */
async function findByDescription(description: string) {
  try {
    // Extract keywords from description
    const keywords = description
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3); // Only words longer than 3 chars

    if (keywords.length === 0) {
      return null;
    }

    // Search for any keyword in HSN descriptions
    const { data, error } = await adminClient
      .from('hsn_tax_mapping')
      .select('*')
      .or(keywords.map((keyword) => `description.ilike.%${keyword}%`).join(','))
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    return null;
  }
}

/**
 * Calculate categorization confidence score
 */
export function calculateCategorizationScore(
  result: CategorizationResult
): CategorizationScoring {
  // Base score on match type and confidence
  let overall_score = result.confidence_score;

  // Adjust based on match type
  if (result.match_type === 'exact') {
    overall_score = Math.max(overall_score, 0.90);
  } else if (result.match_type === 'partial') {
    overall_score = Math.max(overall_score, 0.70);
  } else if (result.match_type === 'default') {
    overall_score = Math.min(overall_score, 0.50);
  }

  // Component scores
  const categorization_confidence = result.confidence_score;
  const hsn_validity = result.hsn_code && !result.fallback_used ? 0.9 : 0.4;
  const tax_rate_confidence = result.match_type === 'exact' ? 0.95 : 0.60;

  // Determine status
  let status: 'categorized' | 'needs_review' | 'unknown' = 'categorized';
  let reason = `HSN ${result.hsn_code} categorized as ${result.category} with ${result.gst_rate}% GST`;

  if (result.fallback_used || overall_score < 0.70) {
    status = 'needs_review';
    reason = `HSN code not found in database - defaulting to ${result.gst_rate}% GST (most common rate). Admin review recommended.`;
  } else if (result.is_exempt) {
    status = 'categorized';
    reason = `HSN ${result.hsn_code} is exempt from GST. Reason: ${result.exemption_reason || 'Standard exemption'}`;
  } else if (result.match_type === 'partial') {
    status = 'needs_review';
    reason = `Partial match for HSN ${result.hsn_code} - applied ${result.gst_rate}% GST based on similar category. Please verify.`;
  }

  return {
    overall_score: Math.round(overall_score * 100) / 100,
    categorization_confidence,
    hsn_validity,
    tax_rate_confidence,
    status,
    reason,
  };
}

/**
 * Validate GST rate against common rates
 */
export function validateGSTRate(rate: number | null): boolean {
  if (rate === null) return false;
  
  const validRates = [0, 0.25, 3, 5, 12, 18, 28]; // Common GST rates in India
  return validRates.includes(rate);
}

/**
 * Calculate expected GST amount based on taxable amount and rate
 */
export function calculateExpectedGST(
  taxableAmount: number,
  gstRate: number,
  isInterState: boolean = false
): {
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
} {
  const totalGST = (taxableAmount * gstRate) / 100;

  if (isInterState) {
    // Inter-state: Only IGST
    return {
      cgst: 0,
      sgst: 0,
      igst: totalGST,
      total_gst: totalGST,
    };
  } else {
    // Intra-state: CGST + SGST (split equally)
    return {
      cgst: totalGST / 2,
      sgst: totalGST / 2,
      igst: 0,
      total_gst: totalGST,
    };
  }
}

/**
 * Get confidence label for UI display
 */
export function getCategorizationLabel(score: number): string {
  if (score >= 0.90) return 'Exact Match';
  if (score >= 0.75) return 'Partial Match';
  if (score >= 0.60) return 'Probable';
  if (score >= 0.40) return 'Default Applied';
  return 'Unknown';
}

/**
 * Get color for categorization confidence (for UI)
 */
export function getCategorizationColor(score: number): string {
  if (score >= 0.90) return '#10b981'; // Green
  if (score >= 0.75) return '#3b82f6'; // Blue
  if (score >= 0.60) return '#f59e0b'; // Amber
  return '#ef4444'; // Red
}
