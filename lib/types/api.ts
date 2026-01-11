// ============================================================================
// Type Definitions for API & Database Models
// ============================================================================

// User Types
export interface User {
  id: string
  email: string
  phone?: string | null
  full_name?: string | null
  role: 'admin' | 'client'
  status: 'active' | 'inactive' | 'invited'
  created_at: string
  updated_at: string
  last_login?: string | null
}

// Client Types
export interface Client {
  id: string
  user_id: string
  gstin: string
  business_name: string
  contact_email?: string | null
  contact_phone?: string | null
  status: 'active' | 'inactive' | 'archived'
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  created_at: string
  updated_at: string
}

// Invoice Types
export interface Invoice {
  id: string
  client_id: string
  file_name: string
  file_path: string
  file_size?: number | null
  invoice_number?: string | null
  invoice_date?: string | null
  vendor_name?: string | null
  vendor_gstin?: string | null
  total_amount?: number | null
  gst_amount?: number | null
  hsn_code?: string | null
  extracted_data?: Record<string, any> | null
  confidence_score?: number | null
  status: 'pending' | 'review' | 'approved' | 'rejected'
  review_notes?: string | null
  approved_by?: string | null
  approved_at?: string | null
  created_at: string
  updated_at: string
}

// Activity Log Types
export interface ActivityLog {
  id: string
  user_id: string | null
  client_id?: string | null
  action: string
  entity_type?: string | null
  entity_id?: string | null
  old_values?: Record<string, any> | null
  new_values?: Record<string, any> | null
  ip_address?: string | null
  user_agent?: string | null
  created_at: string
}

// GST Summary Types
export interface GSTSummary {
  id: string
  client_id: string
  month: number
  year: number
  total_invoices: number
  total_taxable_amount: number
  total_gst: number
  total_approved: number
  total_pending: number
  total_rejected: number
  status: 'draft' | 'submitted' | 'locked'
  gstr_2a_filed: boolean
  gstr_2a_filed_date?: string | null
  reconciliation_notes?: string | null
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface ClientDashboardData {
  clients: Client[]
  totalClients: number
  activeClients: number
  status: 'healthy' | 'warning' | 'critical'
}

export interface AdminDashboardData {
  totalProcessed: number
  autoApprovedToday: number
  needsReview: number
  rejectedToday: number
  averageConfidence: number
  attentionQueue: Invoice[]
}
