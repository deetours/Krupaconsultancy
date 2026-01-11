// ============================================================================
// AI VALIDATION AGENT - GST Invoice Compliance & Duplicate Detection
// ============================================================================

import { adminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ValidationResult {
  invoice_id: string;
  is_valid: boolean;
  overall_confidence: number; // 0-1
  validation_scores: {
    gstin_format: number;
    gst_rate_valid: number;
    amount_calculation: number;
    tax_split_correct: number;
    date_valid: number;
    invoice_number_format: number;
    hsn_rate_consistent: number;
    state_code_valid: number;
    duplicate_check: number;
  };
  violations: ValidationViolation[];
  warnings: ValidationWarning[];
  corrections: ValidationCorrection[];
  duplicate_info: DuplicateCheckResult | null;
  status: 'pass' | 'review' | 'fail';
  reason: string;
}

export interface ValidationViolation {
  rule_name: string;
  severity: 'critical' | 'major' | 'minor';
  field_name: string;
  expected_value: any;
  actual_value: any;
  message: string;
  confidence_impact: number;
}

export interface ValidationWarning {
  rule_name: string;
  field_name: string;
  message: string;
  suggested_value?: any;
}

export interface ValidationCorrection {
  field_name: string;
  original_value: any;
  corrected_value: any;
  confidence: number;
  reason: string;
}

export interface DuplicateCheckResult {
  is_duplicate: boolean;
  confidence: number;
  matched_invoice_id?: string;
  matched_invoice_number?: string;
  match_type: 'exact' | 'fuzzy' | 'partial' | 'none';
  reason: string;
  potential_duplicates?: any[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VALID_GST_RATES = [0, 0.25, 3, 5, 12, 18, 28];

const VALIDATION_WEIGHTS = {
  amount_calculation: 0.25,
  gstin_format: 0.20,
  tax_split_correct: 0.20,
  gst_rate_valid: 0.10,
  date_valid: 0.08,
  hsn_rate_consistent: 0.07,
  duplicate_check: 0.05,
  state_code_valid: 0.03,
  invoice_number_format: 0.02,
};

const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validate GST invoice data and detect duplicates
 */
export async function validateGSTInvoice(
  invoiceId: string,
  clientId: string
): Promise<ValidationResult> {
  const violations: ValidationViolation[] = [];
  const warnings: ValidationWarning[] = [];
  const corrections: ValidationCorrection[] = [];

  try {
    // Fetch invoice with client state
    const { data: invoice, error } = await adminClient
      .from('invoices')
      .select(
        `
        *,
        clients!inner(gstin, state)
      `
      )
      .eq('id', invoiceId)
      .eq('client_id', clientId)
      .single();

    if (error || !invoice) {
      throw new Error('Invoice not found');
    }

    const extractedData = (invoice.extracted_data as any) || {};
    const clientGstin = (invoice.clients as any)?.gstin || '';
    const clientState = (invoice.clients as any)?.state || '';

    // Extract data for validation
    const invoiceNumber = invoice.invoice_number || extractedData.invoice_number;
    const invoiceDate = invoice.invoice_date || extractedData.invoice_date;
    const vendorGstin = invoice.vendor_gstin || extractedData.vendor_gstin;
    const totalAmount = invoice.total_amount || extractedData.total_amount || 0;
    const gstAmount = invoice.gst_amount || extractedData.gst_amount || 0;
    const cgstAmount = extractedData.cgst_amount || 0;
    const sgstAmount = extractedData.sgst_amount || 0;
    const igstAmount = extractedData.igst_amount || 0;
    const taxableAmount =
      extractedData.taxable_amount || extractedData.taxable_value || totalAmount - gstAmount;
    const hsnCode = invoice.hsn_code || extractedData.hsn_code;

    // Calculate GST rate
    const calculatedGstRate =
      taxableAmount > 0 ? (gstAmount / taxableAmount) * 100 : 0;

    // Initialize scores
    const scores = {
      gstin_format: 0,
      gst_rate_valid: 0,
      amount_calculation: 0,
      tax_split_correct: 0,
      date_valid: 0,
      invoice_number_format: 0,
      hsn_rate_consistent: 0,
      state_code_valid: 0,
      duplicate_check: 0,
    };

    // ========================================================================
    // VALIDATION 1: GSTIN Format
    // ========================================================================
    const gstinValidation = validateGSTINFormat(vendorGstin);
    scores.gstin_format = gstinValidation.confidence;

    if (!gstinValidation.valid) {
      violations.push({
        rule_name: 'GSTIN_FORMAT',
        severity: 'critical',
        field_name: 'vendor_gstin',
        expected_value: '15-character GSTIN format',
        actual_value: vendorGstin,
        message: gstinValidation.message,
        confidence_impact: 0.20,
      });
    } else if (gstinValidation.confidence < 1.0) {
      warnings.push({
        rule_name: 'GSTIN_CHECKSUM',
        field_name: 'vendor_gstin',
        message: gstinValidation.message,
      });
    }

    // ========================================================================
    // VALIDATION 2: State Code
    // ========================================================================
    const stateValidation = validateStateCode(gstinValidation.state_code);
    scores.state_code_valid = stateValidation.confidence;

    if (!stateValidation.valid) {
      violations.push({
        rule_name: 'STATE_CODE_INVALID',
        severity: 'major',
        field_name: 'vendor_gstin',
        expected_value: 'Valid state code (01-38)',
        actual_value: gstinValidation.state_code,
        message: stateValidation.message,
        confidence_impact: 0.03,
      });
    }

    // ========================================================================
    // VALIDATION 3: GST Rate
    // ========================================================================
    const rateValidation = validateGSTRate(calculatedGstRate);
    scores.gst_rate_valid = rateValidation.confidence;

    if (!rateValidation.valid) {
      violations.push({
        rule_name: 'GST_RATE_INVALID',
        severity: 'major',
        field_name: 'gst_rate',
        expected_value: 'One of: 0%, 0.25%, 3%, 5%, 12%, 18%, 28%',
        actual_value: `${calculatedGstRate.toFixed(2)}%`,
        message: rateValidation.message,
        confidence_impact: 0.10,
      });
    }

    // ========================================================================
    // VALIDATION 4: Amount Calculation
    // ========================================================================
    const amountValidation = validateAmountCalculation(
      totalAmount,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount
    );
    scores.amount_calculation = amountValidation.confidence;

    if (!amountValidation.valid) {
      violations.push({
        rule_name: 'AMOUNT_MISMATCH',
        severity: 'critical',
        field_name: 'total_amount',
        expected_value: amountValidation.expected_total,
        actual_value: totalAmount,
        message: amountValidation.message,
        confidence_impact: 0.25,
      });
    } else if (amountValidation.difference > 0 && amountValidation.difference <= 1) {
      warnings.push({
        rule_name: 'AMOUNT_ROUNDING',
        field_name: 'total_amount',
        message: `Minor rounding difference of ₹${amountValidation.difference.toFixed(2)}`,
      });
    }

    // ========================================================================
    // VALIDATION 5: Tax Split (CGST/SGST vs IGST)
    // ========================================================================
    const vendorStateCode = gstinValidation.state_code;
    const clientStateCode = clientGstin.substring(0, 2);

    const taxSplitValidation = validateTaxSplit(
      vendorStateCode,
      clientStateCode,
      taxableAmount,
      calculatedGstRate,
      cgstAmount,
      sgstAmount,
      igstAmount
    );
    scores.tax_split_correct = taxSplitValidation.confidence;

    if (!taxSplitValidation.valid) {
      violations.push({
        rule_name: 'TAX_SPLIT_INCORRECT',
        severity: 'critical',
        field_name: taxSplitValidation.is_inter_state ? 'igst_amount' : 'cgst_sgst_amount',
        expected_value: taxSplitValidation.is_inter_state
          ? `IGST: ₹${taxSplitValidation.expected_igst}`
          : `CGST: ₹${taxSplitValidation.expected_cgst}, SGST: ₹${taxSplitValidation.expected_sgst}`,
        actual_value: taxSplitValidation.is_inter_state
          ? `IGST: ₹${igstAmount}`
          : `CGST: ₹${cgstAmount}, SGST: ₹${sgstAmount}`,
        message: taxSplitValidation.message,
        confidence_impact: 0.20,
      });
    }

    // ========================================================================
    // VALIDATION 6: Invoice Date
    // ========================================================================
    const dateValidation = validateInvoiceDate(invoiceDate);
    scores.date_valid = dateValidation.confidence;

    if (!dateValidation.valid) {
      violations.push({
        rule_name: 'DATE_INVALID',
        severity: dateValidation.confidence === 0 ? 'critical' : 'major',
        field_name: 'invoice_date',
        expected_value: 'Valid date not in future',
        actual_value: invoiceDate,
        message: dateValidation.message,
        confidence_impact: dateValidation.confidence === 0 ? 0.08 : 0.04,
      });
    } else if (dateValidation.days_old > 90) {
      warnings.push({
        rule_name: 'DATE_OLD',
        field_name: 'invoice_date',
        message: `Invoice is ${dateValidation.days_old} days old`,
      });
    }

    // ========================================================================
    // VALIDATION 7: Invoice Number Format
    // ========================================================================
    const invoiceNumberValidation = validateInvoiceNumberFormat(invoiceNumber);
    scores.invoice_number_format = invoiceNumberValidation.confidence;

    if (!invoiceNumberValidation.valid) {
      warnings.push({
        rule_name: 'INVOICE_NUMBER_FORMAT',
        field_name: 'invoice_number',
        message: invoiceNumberValidation.message,
      });
    }

    // ========================================================================
    // VALIDATION 8: HSN Rate Consistency
    // ========================================================================
    const hsnValidation = await validateHSNRateConsistency(hsnCode, calculatedGstRate);
    scores.hsn_rate_consistent = hsnValidation.confidence;

    if (!hsnValidation.valid && hsnValidation.expected_rate !== null) {
      warnings.push({
        rule_name: 'HSN_RATE_MISMATCH',
        field_name: 'hsn_code',
        message: hsnValidation.message,
        suggested_value: `${hsnValidation.expected_rate}%`,
      });
    }

    // ========================================================================
    // VALIDATION 9: Duplicate Check
    // ========================================================================
    const duplicateCheck = await checkDuplicateInvoice(
      clientId,
      invoiceNumber,
      vendorGstin,
      invoiceDate,
      totalAmount,
      invoiceId
    );
    scores.duplicate_check = duplicateCheck.confidence;

    if (duplicateCheck.is_duplicate) {
      violations.push({
        rule_name: 'DUPLICATE_INVOICE',
        severity: duplicateCheck.match_type === 'exact' ? 'critical' : 'major',
        field_name: 'invoice_number',
        expected_value: 'Unique invoice',
        actual_value: invoiceNumber,
        message: duplicateCheck.reason,
        confidence_impact: duplicateCheck.match_type === 'exact' ? 0.05 : 0.03,
      });
    } else if (
      duplicateCheck.potential_duplicates &&
      duplicateCheck.potential_duplicates.length > 0
    ) {
      warnings.push({
        rule_name: 'POTENTIAL_DUPLICATE',
        field_name: 'invoice_number',
        message: duplicateCheck.reason,
      });
    }

    // ========================================================================
    // CALCULATE OVERALL CONFIDENCE
    // ========================================================================
    const scoringResult = calculateValidationScore(scores, violations);

    return {
      invoice_id: invoiceId,
      is_valid: scoringResult.status === 'pass',
      overall_confidence: scoringResult.overall_confidence,
      validation_scores: scores,
      violations,
      warnings,
      corrections,
      duplicate_info: duplicateCheck,
      status: scoringResult.status,
      reason: scoringResult.reason,
    };
  } catch (error: any) {
    console.error('Validation error:', error);
    return {
      invoice_id: invoiceId,
      is_valid: false,
      overall_confidence: 0,
      validation_scores: {
        gstin_format: 0,
        gst_rate_valid: 0,
        amount_calculation: 0,
        tax_split_correct: 0,
        date_valid: 0,
        invoice_number_format: 0,
        hsn_rate_consistent: 0,
        state_code_valid: 0,
        duplicate_check: 0,
      },
      violations: [
        {
          rule_name: 'VALIDATION_ERROR',
          severity: 'critical',
          field_name: 'system',
          expected_value: 'Successful validation',
          actual_value: error.message,
          message: `Validation failed: ${error.message}`,
          confidence_impact: 1.0,
        },
      ],
      warnings: [],
      corrections: [],
      duplicate_info: null,
      status: 'fail',
      reason: `Validation error: ${error.message}`,
    };
  }
}

// ============================================================================
// INDIVIDUAL VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate GSTIN format with checksum verification
 */
export function validateGSTINFormat(gstin: string | null): {
  valid: boolean;
  confidence: number;
  state_code: string | null;
  message: string;
} {
  if (!gstin || gstin.trim() === '') {
    return {
      valid: false,
      confidence: 0,
      state_code: null,
      message: 'GSTIN is required',
    };
  }

  const cleanGstin = gstin.trim().toUpperCase();

  // Check length
  if (cleanGstin.length !== 15) {
    return {
      valid: false,
      confidence: 0,
      state_code: null,
      message: `GSTIN must be 15 characters (found ${cleanGstin.length})`,
    };
  }

  // Check format: XX-AAAAAAAAAA-X-Z-X
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleanGstin)) {
    return {
      valid: false,
      confidence: 0.3,
      state_code: cleanGstin.substring(0, 2),
      message: 'GSTIN format is invalid (expected: XX-AAAAA99999-X-Z-X)',
    };
  }

  const stateCode = cleanGstin.substring(0, 2);

  // Verify checksum (simplified - full algorithm is complex)
  const checksumValid = verifyGSTINChecksum(cleanGstin);

  if (!checksumValid) {
    return {
      valid: true, // Format is valid, but checksum might be wrong
      confidence: 0.85, // Lower confidence due to checksum
      state_code: stateCode,
      message: 'GSTIN format valid but checksum verification failed',
    };
  }

  return {
    valid: true,
    confidence: 1.0,
    state_code: stateCode,
    message: 'GSTIN is valid',
  };
}

/**
 * Verify GSTIN checksum (simplified version)
 */
function verifyGSTINChecksum(gstin: string): boolean {
  try {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let sum = 0;

    // Calculate checksum for first 14 characters
    for (let i = 0; i < 14; i++) {
      const char = gstin[i];
      const value = chars.indexOf(char);
      if (value === -1) return false;

      const factor = (i % 2) + 1;
      let product = value * factor;

      const quotient = Math.floor(product / 36);
      const remainder = product % 36;
      sum += quotient + remainder;
    }

    const checkDigit = (36 - (sum % 36)) % 36;
    const expectedChar = chars[checkDigit];
    const actualChar = gstin[14];

    return expectedChar === actualChar;
  } catch {
    return false;
  }
}

/**
 * Validate state code
 */
export function validateStateCode(stateCode: string | null): {
  valid: boolean;
  confidence: number;
  message: string;
} {
  if (!stateCode) {
    return {
      valid: false,
      confidence: 0,
      message: 'State code is missing',
    };
  }

  if (STATE_CODES[stateCode]) {
    return {
      valid: true,
      confidence: 1.0,
      message: `State: ${STATE_CODES[stateCode]}`,
    };
  }

  return {
    valid: false,
    confidence: 0,
    message: `Invalid state code: ${stateCode}`,
  };
}

/**
 * Validate GST rate
 */
export function validateGSTRate(rate: number | null): {
  valid: boolean;
  confidence: number;
  message: string;
} {
  if (rate === null || rate === undefined) {
    return {
      valid: false,
      confidence: 0,
      message: 'GST rate is missing',
    };
  }

  // Round to 2 decimals for comparison
  const roundedRate = Math.round(rate * 100) / 100;

  // Check if rate is in valid list
  const isValid = VALID_GST_RATES.some((validRate) => {
    return Math.abs(roundedRate - validRate) < 0.5;
  });

  if (isValid) {
    return {
      valid: true,
      confidence: 1.0,
      message: `GST rate ${roundedRate}% is valid`,
    };
  }

  // Check if rate is reasonable (< 30%)
  if (roundedRate >= 0 && roundedRate <= 30) {
    return {
      valid: false,
      confidence: 0.5,
      message: `GST rate ${roundedRate}% is not standard. Valid rates: 0%, 0.25%, 3%, 5%, 12%, 18%, 28%`,
    };
  }

  return {
    valid: false,
    confidence: 0,
    message: `GST rate ${roundedRate}% is invalid`,
  };
}

/**
 * Validate total amount calculation
 */
export function validateAmountCalculation(
  totalAmount: number,
  taxableAmount: number,
  cgst: number,
  sgst: number,
  igst: number
): {
  valid: boolean;
  confidence: number;
  difference: number;
  expected_total: number;
  message: string;
} {
  const calculatedTotal = taxableAmount + cgst + sgst + igst;
  const difference = Math.abs(totalAmount - calculatedTotal);

  // Exact match
  if (difference === 0) {
    return {
      valid: true,
      confidence: 1.0,
      difference: 0,
      expected_total: calculatedTotal,
      message: 'Amount calculation is correct',
    };
  }

  // Within ±₹1 (rounding tolerance)
  if (difference <= 1.0) {
    return {
      valid: true,
      confidence: 0.95,
      difference,
      expected_total: calculatedTotal,
      message: `Amount within rounding tolerance (±₹${difference.toFixed(2)})`,
    };
  }

  // Within ±₹10
  if (difference <= 10.0) {
    return {
      valid: false,
      confidence: 0.70,
      difference,
      expected_total: calculatedTotal,
      message: `Amount mismatch: ₹${totalAmount.toFixed(2)} vs expected ₹${calculatedTotal.toFixed(2)} (diff: ₹${difference.toFixed(2)})`,
    };
  }

  // Within ±₹100
  if (difference <= 100.0) {
    return {
      valid: false,
      confidence: 0.40,
      difference,
      expected_total: calculatedTotal,
      message: `Significant amount mismatch: ₹${difference.toFixed(2)}`,
    };
  }

  // Beyond ±₹100
  return {
    valid: false,
    confidence: 0,
    difference,
    expected_total: calculatedTotal,
    message: `Critical amount mismatch: ₹${difference.toFixed(2)}`,
  };
}

/**
 * Validate CGST/SGST vs IGST based on state codes
 */
export function validateTaxSplit(
  vendorStateCode: string,
  clientStateCode: string,
  taxableAmount: number,
  gstRate: number,
  cgst: number,
  sgst: number,
  igst: number
): {
  valid: boolean;
  confidence: number;
  expected_cgst: number;
  expected_sgst: number;
  expected_igst: number;
  is_inter_state: boolean;
  message: string;
} {
  const isInterState = vendorStateCode !== clientStateCode;
  const totalGst = (taxableAmount * gstRate) / 100;

  if (isInterState) {
    // Inter-state: Should use IGST only
    const expectedIgst = totalGst;

    if (cgst !== 0 || sgst !== 0) {
      return {
        valid: false,
        confidence: 0,
        expected_cgst: 0,
        expected_sgst: 0,
        expected_igst: expectedIgst,
        is_inter_state: true,
        message: 'Inter-state transaction must use IGST only (no CGST/SGST)',
      };
    }

    const igstDiff = Math.abs(igst - expectedIgst);

    if (igstDiff <= 1.0) {
      return {
        valid: true,
        confidence: igstDiff === 0 ? 1.0 : 0.95,
        expected_cgst: 0,
        expected_sgst: 0,
        expected_igst: expectedIgst,
        is_inter_state: true,
        message: 'IGST calculation correct',
      };
    }

    return {
      valid: false,
      confidence: 0.5,
      expected_cgst: 0,
      expected_sgst: 0,
      expected_igst: expectedIgst,
      is_inter_state: true,
      message: `IGST mismatch: Expected ₹${expectedIgst.toFixed(2)}, got ₹${igst.toFixed(2)}`,
    };
  } else {
    // Intra-state: Should use CGST + SGST (split equally)
    const expectedCgst = totalGst / 2;
    const expectedSgst = totalGst / 2;

    if (igst !== 0) {
      return {
        valid: false,
        confidence: 0,
        expected_cgst: expectedCgst,
        expected_sgst: expectedSgst,
        expected_igst: 0,
        is_inter_state: false,
        message: 'Intra-state transaction must use CGST+SGST only (no IGST)',
      };
    }

    const cgstDiff = Math.abs(cgst - expectedCgst);
    const sgstDiff = Math.abs(sgst - expectedSgst);

    if (cgstDiff <= 1.0 && sgstDiff <= 1.0) {
      return {
        valid: true,
        confidence: cgstDiff === 0 && sgstDiff === 0 ? 1.0 : 0.95,
        expected_cgst: expectedCgst,
        expected_sgst: expectedSgst,
        expected_igst: 0,
        is_inter_state: false,
        message: 'CGST/SGST calculation correct',
      };
    }

    return {
      valid: false,
      confidence: 0.5,
      expected_cgst: expectedCgst,
      expected_sgst: expectedSgst,
      expected_igst: 0,
      is_inter_state: false,
      message: `CGST/SGST mismatch: Expected ₹${expectedCgst.toFixed(2)} each, got CGST ₹${cgst.toFixed(2)}, SGST ₹${sgst.toFixed(2)}`,
    };
  }
}

/**
 * Validate invoice date
 */
export function validateInvoiceDate(invoiceDate: string | null): {
  valid: boolean;
  confidence: number;
  days_old: number;
  in_current_fy: boolean;
  message: string;
} {
  if (!invoiceDate) {
    return {
      valid: false,
      confidence: 0,
      days_old: 0,
      in_current_fy: false,
      message: 'Invoice date is missing',
    };
  }

  try {
    const date = new Date(invoiceDate);
    const today = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return {
        valid: false,
        confidence: 0,
        days_old: 0,
        in_current_fy: false,
        message: 'Invoice date is invalid',
      };
    }

    // Check if date is in future
    if (date > today) {
      return {
        valid: false,
        confidence: 0,
        days_old: 0,
        in_current_fy: false,
        message: 'Invoice date cannot be in the future',
      };
    }

    // Calculate days old
    const daysOld = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate financial year (India: April 1 to March 31)
    const fyStart = new Date(today.getFullYear(), 3, 1); // April 1
    if (today.getMonth() < 3) {
      fyStart.setFullYear(fyStart.getFullYear() - 1);
    }
    const fyEnd = new Date(fyStart.getFullYear() + 1, 2, 31); // March 31

    const inCurrentFY = date >= fyStart && date <= fyEnd;

    // Determine confidence based on age
    let confidence = 1.0;
    let message = 'Invoice date is valid';

    if (daysOld > 180) {
      confidence = 0.50;
      message = `Invoice is ${daysOld} days old (${Math.floor(daysOld / 30)} months)`;
    } else if (daysOld > 90) {
      confidence = 0.70;
      message = `Invoice is ${daysOld} days old`;
    } else if (daysOld > 30) {
      confidence = 0.90;
      message = `Invoice is ${daysOld} days old`;
    }

    if (!inCurrentFY) {
      confidence = Math.min(confidence, 0.60);
      message += ' and is outside current financial year';
    }

    return {
      valid: true,
      confidence,
      days_old: daysOld,
      in_current_fy: inCurrentFY,
      message,
    };
  } catch (error) {
    return {
      valid: false,
      confidence: 0,
      days_old: 0,
      in_current_fy: false,
      message: 'Failed to parse invoice date',
    };
  }
}

/**
 * Validate invoice number format
 */
export function validateInvoiceNumberFormat(invoiceNumber: string | null): {
  valid: boolean;
  confidence: number;
  message: string;
} {
  if (!invoiceNumber || invoiceNumber.trim() === '') {
    return {
      valid: false,
      confidence: 0,
      message: 'Invoice number is required',
    };
  }

  const cleaned = invoiceNumber.trim();

  // Check length
  if (cleaned.length < 3) {
    return {
      valid: false,
      confidence: 0.3,
      message: 'Invoice number is too short',
    };
  }

  if (cleaned.length > 50) {
    return {
      valid: false,
      confidence: 0.4,
      message: 'Invoice number is too long',
    };
  }

  // Check for common patterns: PREFIX-YYYY-NUMBER or PREFIX/YYYY/NUMBER
  const standardPattern = /^[A-Z]{2,5}[-\/]?\d{4}[-\/]?\d{3,6}$/i;
  if (standardPattern.test(cleaned)) {
    return {
      valid: true,
      confidence: 1.0,
      message: 'Invoice number format is standard',
    };
  }

  // Check if it contains alphanumeric characters
  const alphanumericPattern = /^[A-Z0-9\-\/]+$/i;
  if (alphanumericPattern.test(cleaned)) {
    return {
      valid: true,
      confidence: 0.80,
      message: 'Invoice number format is acceptable',
    };
  }

  return {
    valid: false,
    confidence: 0.60,
    message: 'Invoice number contains unusual characters',
  };
}

/**
 * Validate HSN code against expected GST rate
 */
export async function validateHSNRateConsistency(
  hsnCode: string | null,
  actualRate: number
): Promise<{
  valid: boolean;
  confidence: number;
  expected_rate: number | null;
  message: string;
}> {
  if (!hsnCode || hsnCode.trim() === '') {
    return {
      valid: true, // Not invalid, just no data to validate
      confidence: 0.5,
      expected_rate: null,
      message: 'No HSN code provided for validation',
    };
  }

  try {
    const { data, error } = await adminClient
      .from('hsn_tax_mapping')
      .select('gst_rate, category, description')
      .eq('hsn_code', hsnCode.trim())
      .single();

    if (error || !data) {
      return {
        valid: true, // Not invalid, just not found
        confidence: 0.6,
        expected_rate: null,
        message: `HSN code ${hsnCode} not found in database`,
      };
    }

    const expectedRate = data.gst_rate;
    const rateDiff = Math.abs(actualRate - expectedRate);

    if (rateDiff < 0.5) {
      return {
        valid: true,
        confidence: 1.0,
        expected_rate: expectedRate,
        message: `GST rate matches HSN category: ${data.category}`,
      };
    }

    if (rateDiff <= 5) {
      return {
        valid: false,
        confidence: 0.70,
        expected_rate: expectedRate,
        message: `HSN ${hsnCode} (${data.category}) typically has ${expectedRate}% GST, invoice shows ${actualRate.toFixed(2)}%`,
      };
    }

    return {
      valid: false,
      confidence: 0.40,
      expected_rate: expectedRate,
      message: `Significant rate mismatch: HSN ${hsnCode} expects ${expectedRate}%, invoice has ${actualRate.toFixed(2)}%`,
    };
  } catch (error) {
    return {
      valid: true,
      confidence: 0.5,
      expected_rate: null,
      message: 'Failed to validate HSN rate consistency',
    };
  }
}

/**
 * Check for duplicate invoices
 */
export async function checkDuplicateInvoice(
  clientId: string,
  invoiceNumber: string,
  vendorGstin: string,
  invoiceDate: string,
  totalAmount: number,
  currentInvoiceId?: string
): Promise<DuplicateCheckResult> {
  try {
    // Exact match query
    const { data: exactMatches, error } = await adminClient
      .from('invoices')
      .select('id, invoice_number, total_amount, created_at, vendor_name')
      .eq('client_id', clientId)
      .eq('invoice_number', invoiceNumber)
      .eq('vendor_gstin', vendorGstin)
      .eq('invoice_date', invoiceDate)
      .neq('status', 'rejected')
      .neq('id', currentInvoiceId || '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Duplicate check error:', error);
      return {
        is_duplicate: false,
        confidence: 0.5,
        match_type: 'none',
        reason: 'Failed to check for duplicates',
      };
    }

    // Check for exact match
    if (exactMatches && exactMatches.length > 0) {
      const match = exactMatches[0];
      const amountDiff = Math.abs(match.total_amount - totalAmount);

      if (amountDiff <= 1.0) {
        return {
          is_duplicate: true,
          confidence: 1.0,
          matched_invoice_id: match.id,
          matched_invoice_number: match.invoice_number,
          match_type: 'exact',
          reason: `Exact duplicate found: Invoice #${match.invoice_number} already exists (ID: ${match.id})`,
        };
      }
    }

    // Fuzzy match: Same invoice number, vendor, near date, similar amount
    const { data: fuzzyMatches } = await adminClient
      .from('invoices')
      .select('id, invoice_number, total_amount, invoice_date, vendor_name')
      .eq('client_id', clientId)
      .eq('invoice_number', invoiceNumber)
      .eq('vendor_gstin', vendorGstin)
      .neq('status', 'rejected')
      .neq('id', currentInvoiceId || '00000000-0000-0000-0000-000000000000');

    if (fuzzyMatches && fuzzyMatches.length > 0) {
      for (const match of fuzzyMatches) {
        const amountDiff = Math.abs(match.total_amount - totalAmount);
        const matchDate = new Date(match.invoice_date);
        const invoiceDateObj = new Date(invoiceDate);
        const daysDiff = Math.abs(
          (matchDate.getTime() - invoiceDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (amountDiff <= 10.0 && daysDiff <= 7) {
          return {
            is_duplicate: true,
            confidence: 0.85,
            matched_invoice_id: match.id,
            matched_invoice_number: match.invoice_number,
            match_type: 'fuzzy',
            reason: `Potential duplicate: Similar invoice #${match.invoice_number} within ±7 days and ±₹${amountDiff.toFixed(2)}`,
          };
        }
      }
    }

    // Partial match: Same vendor, similar amount, near date
    const { data: partialMatches } = await adminClient
      .from('invoices')
      .select('id, invoice_number, total_amount, invoice_date, vendor_name')
      .eq('client_id', clientId)
      .eq('vendor_gstin', vendorGstin)
      .neq('status', 'rejected')
      .neq('id', currentInvoiceId || '00000000-0000-0000-0000-000000000000')
      .limit(5);

    if (partialMatches && partialMatches.length > 0) {
      const similarInvoices = partialMatches.filter((match) => {
        const amountDiff = Math.abs(match.total_amount - totalAmount);
        const matchDate = new Date(match.invoice_date);
        const invoiceDateObj = new Date(invoiceDate);
        const daysDiff = Math.abs(
          (matchDate.getTime() - invoiceDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );

        return amountDiff <= 100.0 && daysDiff <= 30;
      });

      if (similarInvoices.length > 0) {
        return {
          is_duplicate: false,
          confidence: 0.70,
          match_type: 'partial',
          reason: `Found ${similarInvoices.length} similar invoice(s) from same vendor within 30 days`,
          potential_duplicates: similarInvoices,
        };
      }
    }

    return {
      is_duplicate: false,
      confidence: 1.0,
      match_type: 'none',
      reason: 'No duplicates found',
    };
  } catch (error: any) {
    console.error('Duplicate check error:', error);
    return {
      is_duplicate: false,
      confidence: 0.5,
      match_type: 'none',
      reason: 'Failed to check for duplicates',
    };
  }
}

/**
 * Calculate overall validation confidence score
 */
export function calculateValidationScore(
  validationScores: Record<string, number>,
  violations: ValidationViolation[]
): {
  overall_confidence: number;
  status: 'pass' | 'review' | 'fail';
  reason: string;
} {
  // Calculate weighted score
  let overallConfidence = 0;
  for (const [rule, score] of Object.entries(validationScores)) {
    const weight = VALIDATION_WEIGHTS[rule as keyof typeof VALIDATION_WEIGHTS] || 0;
    overallConfidence += score * weight;
  }

  // Apply violation penalties
  for (const violation of violations) {
    if (violation.severity === 'critical') {
      overallConfidence = 0; // Automatic fail
      break;
    } else if (violation.severity === 'major') {
      overallConfidence = Math.max(0, overallConfidence - 0.15);
    } else if (violation.severity === 'minor') {
      overallConfidence = Math.max(0, overallConfidence - 0.05);
    }
  }

  // Ensure within bounds
  overallConfidence = Math.max(0, Math.min(1, overallConfidence));

  // Determine status
  let status: 'pass' | 'review' | 'fail' = 'fail';
  let reason = 'Validation failed';

  if (overallConfidence >= 0.95) {
    status = 'pass';
    reason = 'All validations passed with high confidence';
  } else if (overallConfidence >= 0.80) {
    status = 'review';
    reason = violations.length > 0 ? violations[0].message : 'Some validations need manual review';
  } else {
    status = 'fail';
    reason =
      violations.find((v) => v.severity === 'critical')?.message ||
      'Multiple validation failures detected';
  }

  return {
    overall_confidence: Math.round(overallConfidence * 100) / 100,
    status,
    reason,
  };
}

/**
 * Get validation status label for UI
 */
export function getValidationStatusLabel(confidence: number): string {
  if (confidence >= 0.95) return 'Validated';
  if (confidence >= 0.80) return 'Needs Review';
  if (confidence >= 0.60) return 'Issues Found';
  return 'Failed';
}

/**
 * Get validation color for UI
 */
export function getValidationColor(confidence: number): string {
  if (confidence >= 0.95) return '#10b981'; // Green
  if (confidence >= 0.80) return '#f59e0b'; // Amber
  if (confidence >= 0.60) return '#ef4444'; // Red
  return '#dc2626'; // Dark red
}
