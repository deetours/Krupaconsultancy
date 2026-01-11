import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CreateClientSchema } from '@/lib/schemas'
import { logActivity, successResponse, errorResponse } from '@/lib/helpers'

// GET: List all clients for user
export async function GET(request: NextRequest) {
  try {
    // In production, verify JWT token and extract user ID
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch clients'),
        { status: 500 }
      )
    }

    return NextResponse.json(
      successResponse(clients)
    )
  } catch (error) {
    console.error('Get clients error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}

// POST: Create new client
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
    const validation = CreateClientSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if GSTIN already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('gstin', validation.data.gstin)
      .single()

    if (existing) {
      return NextResponse.json(
        errorResponse('GSTIN already registered'),
        { status: 400 }
      )
    }

    // Create client
    const { data: client, error } = await supabase
      .from('clients')
      .insert([
        {
          user_id: userId,
          ...validation.data,
          status: 'active',
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to create client'),
        { status: 500 }
      )
    }

    // Log activity
    await logActivity(userId, 'client_created', 'clients', client.id, null, client)

    return NextResponse.json(
      successResponse(client, 'Client created successfully'),
      { status: 201 }
    )
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}
