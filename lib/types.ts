export interface Invoice {
  id: string
  client_id: string
  invoice_number: string
  date: string
  supplier_gstin: string
  hsn_code: string
  taxable_value: number
  igst: number
  cgst: number
  sgst: number
  confidence_score: Record<string, number>
  status: "pending" | "review" | "approved" | "rejected"
  agent_explanation: string
  file_url: string
  created_at?: string
}

export interface Client {
  id: string
  name: string
  gstin: string
  turnover_band: "<1cr" | "1-5cr" | ">5cr"
  filing_frequency: "monthly" | "quarterly"
  status: "active" | "suspended"
  last_filing?: string
  invoice_count?: number
}

export interface GSTMonthlyData {
  month: string
  liability: number
  itc: number
}

export interface DashboardStats {
  needsDecision: number
  forReview: number
  autoProcessed: number
}
