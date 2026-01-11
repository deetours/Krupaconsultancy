import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreateInvoiceSchema } from '@/lib/schemas'
import { logActivity, successResponse, errorResponse } from '@/lib/helpers'

// GET: List invoices for user's clients
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    const clientId = request.nextUrl.searchParams.get('client_id')
    const status = request.nextUrl.searchParams.get('status')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    const supabase = createAdminClient()

    // Get user's clients first
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)

    if (!clients || clients.length === 0) {
      return NextResponse.json(
        successResponse({ invoices: [], count: 0, total: 0 })
      )
    }

    const clientIds = clients.map(c => c.id)

    // Build query
    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .in('client_id', clientIds)

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: invoices, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch invoices'),
        { status: 500 }
      )
    }

    return NextResponse.json(
      successResponse({ invoices, count: count || 0, limit, offset })
    )
  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}

// POST: Create invoice entry (for uploads)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = CreateInvoiceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify client belongs to user
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', validation.data.client_id)
      .eq('user_id', userId)
      .single()

    if (!client) {
      return NextResponse.json(
        errorResponse('Client not found'),
        { status: 404 }
      )
    }

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert([
        {
          ...validation.data,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to create invoice'),
        { status: 500 }
      )
    }

    // Log activity
    await logActivity(userId, 'invoice_created', 'invoices', invoice.id, null, invoice)

    return NextResponse.json(
      successResponse(invoice, 'Invoice created successfully'),
      { status: 201 }
    )
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}
