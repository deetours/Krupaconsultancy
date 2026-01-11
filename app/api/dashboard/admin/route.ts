import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse } from '@/lib/helpers'

// GET: Admin dashboard data
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

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      )
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Total processed today
    const { count: totalProcessedToday } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .gte('created_at', `${today}T00:00:00`)

    // Auto-approved today
    const { count: autoApprovedToday } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .gte('created_at', `${today}T00:00:00`)

    // Needs review
    const { data: needsReviewData, count: needsReviewCount } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .in('status', ['pending', 'review'])
      .order('confidence_score', { ascending: true })
      .limit(10)

    // Rejected today
    const { count: rejectedToday } = await supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('status', 'rejected')
      .gte('created_at', `${today}T00:00:00`)

    // Average confidence
    const { data: confidenceData } = await supabase
      .from('invoices')
      .select('confidence_score')
      .not('confidence_score', 'is', null)
      .limit(100)

    const averageConfidence = confidenceData && confidenceData.length > 0
      ? (confidenceData.reduce((sum, inv) => sum + (inv.confidence_score || 0), 0) / confidenceData.length * 100).toFixed(1)
      : 0

    return NextResponse.json(
      successResponse({
        totalProcessed: totalProcessedToday || 0,
        autoApprovedToday: autoApprovedToday || 0,
        needsReview: needsReviewCount || 0,
        rejectedToday: rejectedToday || 0,
        averageConfidence: parseFloat(String(averageConfidence)),
        attentionQueue: needsReviewData || [],
      })
    )
  } catch (error) {
    console.error('Get dashboard data error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}
