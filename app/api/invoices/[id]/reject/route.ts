import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { RejectInvoiceSchema } from '@/lib/schemas'
import { logActivity, successResponse, errorResponse } from '@/lib/helpers'

// POST: Reject invoice
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    // Validate input
    const validation = RejectInvoiceSchema.safeParse({ invoice_id: id, ...body })
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (!invoice) {
      return NextResponse.json(
        errorResponse('Invoice not found'),
        { status: 404 }
      )
    }

    // Update invoice
    const { data: updated, error } = await supabase
      .from('invoices')
      .update({
        status: 'rejected',
        review_notes: validation.data.review_notes,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to reject invoice'),
        { status: 500 }
      )
    }

    // Log activity
    await logActivity(
      userId,
      'invoice_rejected',
      'invoices',
      id,
      invoice,
      updated
    )

    return NextResponse.json(
      successResponse(updated, 'Invoice rejected successfully')
    )
  } catch (error) {
    console.error('Reject invoice error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}
