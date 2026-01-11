// ============================================================================
// APPROVAL WORKFLOW & ACTIVITY LOGGING
// ============================================================================

import { adminClient } from '@/lib/supabase/admin';
import { logActivity } from '@/lib/helpers';

export interface ApprovalResult {
  success: boolean;
  invoiceId: string;
  previousStatus: string;
  newStatus: string;
  approvedBy?: string;
  message: string;
}

/**
 * Auto-approve high-confidence invoices
 */
export async function autoApproveInvoice(
  invoiceId: string,
  approvedBy: string
): Promise<ApprovalResult> {
  try {
    // Get current invoice
    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return {
        success: false,
        invoiceId,
        previousStatus: 'unknown',
        newStatus: 'unknown',
        message: 'Invoice not found',
      };
    }

    const previousStatus = invoice.status;

    // Update invoice status
    const { error: updateError } = await adminClient
      .from('invoices')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (updateError) {
      return {
        success: false,
        invoiceId,
        previousStatus,
        newStatus: 'approved',
        message: `Update failed: ${updateError.message}`,
      };
    }

    // Log activity
    await logActivity(
      approvedBy,
      invoice.client_id,
      'invoice_auto_approved',
      'invoice',
      invoiceId,
      { status: previousStatus },
      { status: 'approved' }
    );

    // Update GST summary
    await updateGSTSummary(invoice.client_id, invoice.invoice_date);

    return {
      success: true,
      invoiceId,
      previousStatus,
      newStatus: 'approved',
      approvedBy,
      message: 'Invoice auto-approved due to high confidence score',
    };
  } catch (error) {
    console.error('Auto-approval error:', error);
    return {
      success: false,
      invoiceId,
      previousStatus: 'unknown',
      newStatus: 'unknown',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Admin approve invoice with optional notes
 */
export async function manualApproveInvoice(
  invoiceId: string,
  approvedBy: string,
  notes?: string
): Promise<ApprovalResult> {
  try {
    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return {
        success: false,
        invoiceId,
        previousStatus: 'unknown',
        newStatus: 'unknown',
        message: 'Invoice not found',
      };
    }

    const previousStatus = invoice.status;

    const { error: updateError } = await adminClient
      .from('invoices')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        review_notes: notes || '',
      })
      .eq('id', invoiceId);

    if (updateError) {
      return {
        success: false,
        invoiceId,
        previousStatus,
        newStatus: 'approved',
        message: `Update failed: ${updateError.message}`,
      };
    }

    // Log activity
    await logActivity(
      approvedBy,
      invoice.client_id,
      'invoice_manually_approved',
      'invoice',
      invoiceId,
      { status: previousStatus, review_notes: invoice.review_notes },
      { status: 'approved', review_notes: notes || '' }
    );

    // Update GST summary
    await updateGSTSummary(invoice.client_id, invoice.invoice_date);

    return {
      success: true,
      invoiceId,
      previousStatus,
      newStatus: 'approved',
      approvedBy,
      message: 'Invoice approved manually' + (notes ? ` with notes: ${notes}` : ''),
    };
  } catch (error) {
    console.error('Manual approval error:', error);
    return {
      success: false,
      invoiceId,
      previousStatus: 'unknown',
      newStatus: 'unknown',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Reject invoice with required reason
 */
export async function rejectInvoice(
  invoiceId: string,
  rejectedBy: string,
  reason: string
): Promise<ApprovalResult> {
  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      invoiceId,
      previousStatus: 'unknown',
      newStatus: 'unknown',
      message: 'Rejection reason is required',
    };
  }

  try {
    const { data: invoice, error: fetchError } = await adminClient
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError || !invoice) {
      return {
        success: false,
        invoiceId,
        previousStatus: 'unknown',
        newStatus: 'unknown',
        message: 'Invoice not found',
      };
    }

    const previousStatus = invoice.status;

    const { error: updateError } = await adminClient
      .from('invoices')
      .update({
        status: 'rejected',
        review_notes: reason,
        approved_by: rejectedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (updateError) {
      return {
        success: false,
        invoiceId,
        previousStatus,
        newStatus: 'rejected',
        message: `Update failed: ${updateError.message}`,
      };
    }

    // Log activity
    await logActivity(
      rejectedBy,
      invoice.client_id,
      'invoice_rejected',
      'invoice',
      invoiceId,
      { status: previousStatus },
      { status: 'rejected', rejection_reason: reason }
    );

    return {
      success: true,
      invoiceId,
      previousStatus,
      newStatus: 'rejected',
      approvedBy: rejectedBy,
      message: `Invoice rejected. Reason: ${reason}`,
    };
  } catch (error) {
    console.error('Rejection error:', error);
    return {
      success: false,
      invoiceId,
      previousStatus: 'unknown',
      newStatus: 'unknown',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Update GST summary after invoice approval
 */
async function updateGSTSummary(clientId: string, invoiceDate: string | null) {
  try {
    if (!invoiceDate) return;

    const date = new Date(invoiceDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Get or create GST summary
    const { data: existing } = await adminClient
      .from('gst_summary')
      .select('*')
      .eq('client_id', clientId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (existing) {
      // Update existing summary
      await adminClient
        .from('gst_summary')
        .update({
          total_approved: (existing.total_approved || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new summary
      await adminClient.from('gst_summary').insert({
        client_id: clientId,
        month,
        year,
        total_invoices: 1,
        total_approved: 1,
        status: 'draft',
      });
    }
  } catch (error) {
    console.error('Error updating GST summary:', error);
    // Don't throw - this is secondary operation
  }
}
