import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse } from '@/lib/helpers'

// GET: Client dashboard data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get user's clients
    const { data: clients, count: totalClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (!clients) {
      return NextResponse.json(
        successResponse({
          clients: [],
          totalClients: 0,
          activeClients: 0,
          status: 'healthy',
          recentInvoices: [],
          totalInvoices: 0,
          averageConfidence: 0,
        })
      )
    }

    const clientIds = clients.map(c => c.id)
    const activeClients = clients.filter(c => c.status === 'active').length

    // Get recent invoices for all clients
    const { data: invoices, count: totalInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .in('client_id', clientIds)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get average confidence
    const { data: confidenceData } = await supabase
      .from('invoices')
      .select('confidence_score')
      .in('client_id', clientIds)
      .not('confidence_score', 'is', null)

    const averageConfidence = confidenceData && confidenceData.length > 0
      ? (confidenceData.reduce((sum, inv) => sum + (inv.confidence_score || 0), 0) / confidenceData.length * 100).toFixed(1)
      : 0

    // Determine status
    let status = 'healthy'
    if (activeClients === 0) {
      status = 'warning'
    }

    return NextResponse.json(
      successResponse({
        clients,
        totalClients: totalClients || 0,
        activeClients,
        status,
        recentInvoices: invoices || [],
        totalInvoices: totalInvoices || 0,
        averageConfidence: parseFloat(String(averageConfidence)),
      })
    )
  } catch (error) {
    console.error('Get client dashboard data error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}
