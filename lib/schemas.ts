import { z } from 'zod'

// ============================================================================
// AUTHENTICATION VALIDATION SCHEMAS
// ============================================================================

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const LogoutSchema = z.object({
  token: z.string().optional(),
})

export type LogoutInput = z.infer<typeof LogoutSchema>

// ============================================================================
// CLIENT VALIDATION SCHEMAS
// ============================================================================

export const CreateClientSchema = z.object({
  gstin: z.string().length(15, 'GSTIN must be exactly 15 characters'),
  business_name: z.string().min(2, 'Business name is required'),
  contact_email: z.string().email('Invalid email address').optional(),
  contact_phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
})

export type CreateClientInput = z.infer<typeof CreateClientSchema>

export const UpdateClientSchema = CreateClientSchema.partial()

export type UpdateClientInput = z.infer<typeof UpdateClientSchema>

// ============================================================================
// INVOICE VALIDATION SCHEMAS
// ============================================================================

export const CreateInvoiceSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  file_name: z.string().min(1, 'File name is required'),
  file_path: z.string().min(1, 'File path is required'),
  file_size: z.number().positive().optional(),
})

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>

export const UpdateInvoiceSchema = z.object({
  invoice_number: z.string().optional(),
  invoice_date: z.string().date().optional(),
  vendor_name: z.string().optional(),
  vendor_gstin: z.string().length(15).optional(),
  total_amount: z.number().positive().optional(),
  gst_amount: z.number().positive().optional(),
  hsn_code: z.string().optional(),
  extracted_data: z.record(z.any()).optional(),
  confidence_score: z.number().min(0).max(1).optional(),
  status: z.enum(['pending', 'review', 'approved', 'rejected']).optional(),
  review_notes: z.string().optional(),
})

export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>

export const ApproveInvoiceSchema = z.object({
  invoice_id: z.string().uuid('Invalid invoice ID'),
  review_notes: z.string().optional(),
})

export type ApproveInvoiceInput = z.infer<typeof ApproveInvoiceSchema>

export const RejectInvoiceSchema = z.object({
  invoice_id: z.string().uuid('Invalid invoice ID'),
  review_notes: z.string().min(1, 'Rejection reason is required'),
})

export type RejectInvoiceInput = z.infer<typeof RejectInvoiceSchema>

// ============================================================================
// INVITE VALIDATION SCHEMAS
// ============================================================================

export const CreateInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  gstin: z.string().length(15, 'GSTIN must be exactly 15 characters').optional(),
})

export type CreateInviteInput = z.infer<typeof CreateInviteSchema>

export const AcceptInviteSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name is required'),
})

export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>
