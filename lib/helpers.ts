import { createAdminClient } from '@/lib/supabase/admin'
import { ApiResponse, User } from '@/lib/types/api'
import { hash, compare } from 'bcrypt'
import { nanoid } from 'nanoid'

// ============================================================================
// PASSWORD HASHING
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash)
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null
  return data as User
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as User
}

export async function createUser(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  role: 'admin' | 'client' = 'client'
): Promise<{ user: User; error?: string }> {
  // Check if user exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { user: null as any, error: 'Email already registered' }
  }

  const passwordHash = await hashPassword(password)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone,
        role,
        status: 'active',
      },
    ])
    .select()
    .single()

  if (error) {
    return { user: null as any, error: error.message }
  }

  return { user: data as User }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', userId)
}

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

export async function logActivity(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const supabase = createAdminClient()

  await supabase.from('activity_log').insert([
    {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
      user_agent: userAgent,
    },
  ])
}

// ============================================================================
// TOKEN GENERATION
// ============================================================================

export function generateToken(): string {
  return nanoid(32)
}

export function generateInviteToken(): string {
  return nanoid(32)
}

// ============================================================================
// CLIENT OPERATIONS
// ============================================================================

export async function getClientsByUserId(userId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return null
  }

  return data
}

export async function getClientByGSTIN(gstin: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('gstin', gstin)
    .single()

  if (error) return null
  return data
}

// ============================================================================
// INVOICE OPERATIONS
// ============================================================================

export async function getInvoicesByClientId(clientId: string, limit = 50, offset = 0) {
  const supabase = createAdminClient()

  const { data, error, count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching invoices:', error)
    return { invoices: null, count: 0 }
  }

  return { invoices: data, count: count || 0 }
}

export async function getInvoicesNeedingReview(limit = 50) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .in('status', ['pending', 'review'])
    .order('confidence_score', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching invoices needing review:', error)
    return null
  }

  return data
}

export async function getAutoApprovedCount() {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error, count } = await supabase
    .from('invoices')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')
    .gte('created_at', `${today}T00:00:00`)

  if (error) return 0
  return count || 0
}

// ============================================================================
// GST SUMMARY OPERATIONS
// ============================================================================

export async function getOrCreateGSTSummary(clientId: string, month: number, year: number) {
  const supabase = createAdminClient()

  // Try to fetch existing summary
  const { data: existing } = await supabase
    .from('gst_summary')
    .select('*')
    .eq('client_id', clientId)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (existing) {
    return existing
  }

  // Create new summary
  const { data: created, error } = await supabase
    .from('gst_summary')
    .insert([
      {
        client_id: clientId,
        month,
        year,
        total_invoices: 0,
        total_taxable_amount: 0,
        total_gst: 0,
        total_approved: 0,
        total_pending: 0,
        total_rejected: 0,
        status: 'draft',
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating GST summary:', error)
    return null
  }

  return created
}

// ============================================================================
// ERROR RESPONSE HELPER
// ============================================================================

export function errorResponse(message: string, status: number = 400): ApiResponse {
  return {
    success: false,
    error: message,
  }
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}
