import { NextRequest, NextResponse } from 'next/server'
import { LoginSchema } from '@/lib/schemas'
import { getUserByEmail, verifyPassword, updateUserLastLogin, logActivity, successResponse, errorResponse, generateToken } from '@/lib/helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = LoginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error.errors[0].message),
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Get user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        errorResponse('Invalid email or password'),
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash || '')
    if (!passwordValid) {
      return NextResponse.json(
        errorResponse('Invalid email or password'),
        { status: 401 }
      )
    }

    // Update last login
    await updateUserLastLogin(user.id)

    // Log activity
    await logActivity(user.id, 'user_login', 'user', user.id, null, null, request.ip || undefined)

    // Generate token
    const token = generateToken()

    // Return user data
    const { password_hash, ...userWithoutHash } = user as any
    return NextResponse.json(
      successResponse(
        {
          user: userWithoutHash,
          token,
        },
        'Login successful'
      )
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      errorResponse('An unexpected error occurred'),
      { status: 500 }
    )
  }
}
