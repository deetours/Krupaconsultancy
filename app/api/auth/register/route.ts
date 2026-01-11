import { NextRequest, NextResponse } from 'next/server'
import { RegisterSchema } from '@/lib/schemas'
import { createUser, logActivity, successResponse, errorResponse } from '@/lib/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = RegisterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: 400 }
      )
    }

    const { email, password, full_name, phone } = validation.data

    // Create user
    const { user, error } = await createUser(email, password, full_name, phone, 'client')

    if (error) {
      return NextResponse.json(errorResponse(error), { status: 400 })
    }

    // Log activity
    await logActivity(user.id, 'user_registered', 'user', user.id, null, { email })

    // Return user data (exclude sensitive fields)
    const { password_hash, ...userWithoutHash } = user as any
    return NextResponse.json(
      successResponse(userWithoutHash, 'Registration successful'),
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}
