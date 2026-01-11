import { NextRequest, NextResponse } from 'next/server'
import { successResponse } from '@/lib/helpers'

export async function POST(request: NextRequest) {
  try {
    // In a real app, you would invalidate the token here
    // For now, just return success (client should clear localStorage)
    
    return NextResponse.json(
      successResponse(null, 'Logged out successfully')
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
