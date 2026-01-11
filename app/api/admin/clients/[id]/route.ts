import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { UpdateClientSchema } from '@/lib/schemas'
import { logActivity, successResponse, errorResponse } from '@/lib/helpers'

// GET: Get single client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !client) {
      return NextResponse.json(
        errorResponse('Client not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(successResponse(client))
  } catch (error) {
    console.error('Get client error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}

// PUT: Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = UpdateClientSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get existing client
    const { data: existing } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) {
      return NextResponse.json(
        errorResponse('Client not found'),
        { status: 404 }
      )
    }

    // Update client
    const { data: updated, error } = await supabase
      .from('clients')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to update client'),
        { status: 500 }
      )
    }

    // Log activity
    await logActivity(userId, 'client_updated', 'clients', id, existing, updated)

    return NextResponse.json(
      successResponse(updated, 'Client updated successfully')
    )
  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}

// DELETE: Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get client
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!client) {
      return NextResponse.json(
        errorResponse('Client not found'),
        { status: 404 }
      )
    }

    // Delete client
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to delete client'),
        { status: 500 }
      )
    }

    // Log activity
    await logActivity(userId, 'client_deleted', 'clients', id, client, null)

    return NextResponse.json(
      successResponse(null, 'Client deleted successfully')
    )
  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}
