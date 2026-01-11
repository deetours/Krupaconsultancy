// ============================================================================
// CATEGORIZATION API ENDPOINT - HSN Code Processing
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { 
  categorizeInvoice, 
  calculateCategorizationScore,
  CategorizationResult 
} from '@/lib/ai/categorizer';

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

    // Fetch invoice data
    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this invoice
    if (invoice.user_id !== user_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to invoice' },
        { status: 403 }
      );
    }

    // Get HSN code from extracted data
    const extractedData = invoice.extracted_data as any || {};
    const hsnCode = extractedData.hsn_code || null;
    const amount = extractedData.total_amount || invoice.amount || null;
    const description = extractedData.description || invoice.invoice_number || null;

    // If no extraction data, return error
    if (!extractedData || Object.keys(extractedData).length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invoice has not been extracted yet. Please run extraction first.' 
        },
        { status: 400 }
      );
    }

    // Perform categorization
    const categorizationResult: CategorizationResult = await categorizeInvoice(
      hsnCode,
      amount,
      description
    );

    // Calculate categorization score
    const scoring = calculateCategorizationScore(categorizationResult);

    // Update invoice with categorization data
    const updatedExtractedData = {
      ...extractedData,
      categorization: {
        hsn_code: categorizationResult.hsn_code,
        category: categorizationResult.category,
        description: categorizationResult.description,
        gst_rate: categorizationResult.gst_rate,
        is_exempt: categorizationResult.is_exempt,
        exemption_reason: categorizationResult.exemption_reason,
        match_type: categorizationResult.match_type,
        fallback_used: categorizationResult.fallback_used,
        categorized_at: new Date().toISOString(),
      },
    };

    const { error: updateError } = await adminClient
      .from('invoices')
      .update({
        extracted_data: updatedExtractedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice_id);

    if (updateError) {
      console.error('Failed to update invoice with categorization:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save categorization results' },
        { status: 500 }
      );
    }

    // Store categorization confidence
    const { error: confidenceError } = await adminClient
      .from('extraction_confidence')
      .insert({
        invoice_id,
        overall_confidence: scoring.overall_score,
        field_confidences: {
          categorization_confidence: scoring.categorization_confidence,
          hsn_validity: scoring.hsn_validity,
          tax_rate_confidence: scoring.tax_rate_confidence,
        },
        status: scoring.status,
        needs_review: scoring.status === 'needs_review',
        review_reason: scoring.reason,
        created_at: new Date().toISOString(),
      });

    if (confidenceError) {
      console.error('Failed to store confidence:', confidenceError);
      // Don't fail the request if confidence storage fails
    }

    // Log activity
    await adminClient.from('activity_log').insert({
      user_id,
      action: 'invoice_categorized',
      entity_type: 'invoice',
      entity_id: invoice_id,
      details: {
        hsn_code: categorizationResult.hsn_code,
        category: categorizationResult.category,
        gst_rate: categorizationResult.gst_rate,
        match_type: categorizationResult.match_type,
        confidence: scoring.overall_score,
        status: scoring.status,
      },
      created_at: new Date().toISOString(),
    });

    // Return categorization results
    return NextResponse.json({
      success: true,
      data: {
        invoice_id,
        categorization: categorizationResult,
        scoring,
        needs_review: scoring.status === 'needs_review',
      },
    });

  } catch (error: any) {
    console.error('Categorization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to categorize invoice' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint - Check categorization status
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

    // Fetch invoice with categorization data
    const { data: invoice, error } = await adminClient
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .eq('user_id', user_id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const extractedData = invoice.extracted_data as any || {};
    const categorization = extractedData.categorization || null;

    return NextResponse.json({
      success: true,
      data: {
        invoice_id,
        has_categorization: !!categorization,
        categorization,
      },
    });

  } catch (error: any) {
    console.error('Error fetching categorization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categorization' },
      { status: 500 }
    );
  }
}
