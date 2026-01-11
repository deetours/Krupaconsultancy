// ============================================================================
// VALIDATION API ENDPOINT - GST Invoice Validation & Duplicate Detection
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { validateGSTInvoice, ValidationResult } from '@/lib/ai/validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice_id, user_id } = body;

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

    // Fetch invoice to verify ownership
    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('*, clients!inner(user_id)')
      .eq('id', invoice_id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this invoice
    const invoiceUserId = (invoice.clients as any)?.user_id;
    if (invoiceUserId !== user_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to invoice' },
        { status: 403 }
      );
    }

    // Check if invoice has been extracted
    const extractedData = invoice.extracted_data as any;
    if (!extractedData || Object.keys(extractedData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice has not been extracted yet. Please run extraction first.',
        },
        { status: 400 }
      );
    }

    // Perform validation
    const validationResult: ValidationResult = await validateGSTInvoice(
      invoice_id,
      invoice.client_id
    );

    // Store validation results in extraction_confidence table
    const confidenceRecords = [];

    // Store each validation rule score
    for (const [ruleName, score] of Object.entries(validationResult.validation_scores)) {
      confidenceRecords.push({
        invoice_id,
        field_name: ruleName,
        confidence_score: score,
        extracted_value: null,
        validated_value: null,
        is_corrected: false,
        correction_source: 'auto_validation',
      });
    }

    // Insert all confidence records
    if (confidenceRecords.length > 0) {
      const { error: confidenceError } = await adminClient
        .from('extraction_confidence')
        .insert(confidenceRecords);

      if (confidenceError) {
        console.error('Failed to store validation confidence:', confidenceError);
        // Don't fail the request if confidence storage fails
      }
    }

    // Update invoice status based on validation result
    let newStatus = invoice.status;
    if (validationResult.status === 'pass' && validationResult.overall_confidence >= 0.95) {
      newStatus = 'approved'; // Auto-approve
    } else if (validationResult.status === 'review' || validationResult.overall_confidence >= 0.80) {
      newStatus = 'review'; // Needs manual review
    } else {
      newStatus = 'pending'; // Keep pending or set to rejected
    }

    // Prepare review notes with violations
    let reviewNotes = validationResult.reason;
    if (validationResult.violations.length > 0) {
      reviewNotes += '\n\nViolations:\n';
      validationResult.violations.forEach((v, i) => {
        reviewNotes += `${i + 1}. [${v.severity.toUpperCase()}] ${v.message}\n`;
      });
    }
    if (validationResult.warnings.length > 0) {
      reviewNotes += '\n\nWarnings:\n';
      validationResult.warnings.forEach((w, i) => {
        reviewNotes += `${i + 1}. ${w.message}\n`;
      });
    }

    // Update invoice
    const { error: updateError } = await adminClient
      .from('invoices')
      .update({
        confidence_score: validationResult.overall_confidence,
        status: newStatus,
        review_notes: reviewNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice_id);

    if (updateError) {
      console.error('Failed to update invoice with validation results:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save validation results' },
        { status: 500 }
      );
    }

    // Log activity
    await adminClient.from('activity_log').insert({
      user_id,
      client_id: invoice.client_id,
      action: 'invoice_validated',
      entity_type: 'invoice',
      entity_id: invoice_id,
      old_values: {
        status: invoice.status,
        confidence_score: invoice.confidence_score,
      },
      new_values: {
        status: newStatus,
        confidence_score: validationResult.overall_confidence,
        validation_status: validationResult.status,
        violations_count: validationResult.violations.length,
        warnings_count: validationResult.warnings.length,
      },
      created_at: new Date().toISOString(),
    });

    // Return validation results
    return NextResponse.json({
      success: true,
      data: {
        invoice_id,
        validation: validationResult,
        updated_status: newStatus,
        auto_approved: newStatus === 'approved',
        needs_review: newStatus === 'review',
      },
    });
  } catch (error: any) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to validate invoice',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Retrieve validation results
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

    // Fetch invoice with validation data
    const { data: invoice, error } = await adminClient
      .from('invoices')
      .select(
        `
        id,
        invoice_number,
        status,
        confidence_score,
        review_notes,
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

    // Fetch validation confidence scores
    const { data: confidenceScores, error: confidenceError } = await adminClient
      .from('extraction_confidence')
      .select('field_name, confidence_score, created_at')
      .eq('invoice_id', invoice_id)
      .eq('correction_source', 'auto_validation')
      .order('created_at', { ascending: false })
      .limit(20);

    if (confidenceError) {
      console.error('Failed to fetch confidence scores:', confidenceError);
    }

    // Parse review notes to extract violations
    const reviewNotes = invoice.review_notes || '';
    const hasViolations = reviewNotes.includes('Violations:');
    const hasWarnings = reviewNotes.includes('Warnings:');

    return NextResponse.json({
      success: true,
      data: {
        invoice_id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        overall_confidence: invoice.confidence_score,
        validation_scores: confidenceScores || [],
        has_violations: hasViolations,
        has_warnings: hasWarnings,
        review_notes: reviewNotes,
      },
    });
  } catch (error: any) {
    console.error('Error fetching validation results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch validation results' },
      { status: 500 }
    );
  }
}
