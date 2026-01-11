-- ============================================================================
-- KRUPA CONSULTANCY GST AUTOMATION - CUSTOM SCHEMA
-- ============================================================================
-- This file creates ONLY custom tables for Krupa
-- Supabase auth tables (auth.users) are managed by Supabase itself
-- Project ID: cqvkeejqmegisyjgqgrm
-- Created: 2026-01-12
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CLIENTS TABLE (GST registrations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gstin VARCHAR(15) UNIQUE NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  status VARCHAR(50) CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. INVOICES TABLE (Upload and processing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_size BIGINT,
  invoice_number VARCHAR(100),
  invoice_date DATE,
  vendor_name VARCHAR(255),
  vendor_gstin VARCHAR(15),
  total_amount DECIMAL(15, 2),
  gst_amount DECIMAL(15, 2),
  hsn_code VARCHAR(10),
  extracted_data JSONB,
  pipeline_state VARCHAR(50) CHECK (pipeline_state IN ('uploaded', 'extracting', 'extracted', 'categorizing', 'categorized', 'validating', 'validated', 'approving', 'completed', 'failed')) DEFAULT 'uploaded',
  pipeline_result JSONB,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
  status VARCHAR(50) CHECK (status IN ('pending', 'review', 'approved', 'rejected')) DEFAULT 'pending',
  review_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. ACTIVITY LOG TABLE (Audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. GST SUMMARY TABLE (Monthly reconciliation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gst_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  year INTEGER,
  total_invoices INTEGER DEFAULT 0,
  total_taxable_amount DECIMAL(15, 2) DEFAULT 0,
  total_gst DECIMAL(15, 2) DEFAULT 0,
  total_approved INTEGER DEFAULT 0,
  total_pending INTEGER DEFAULT 0,
  total_rejected INTEGER DEFAULT 0,
  status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'locked')) DEFAULT 'draft',
  gstr_2a_filed BOOLEAN DEFAULT FALSE,
  gstr_2a_filed_date DATE,
  reconciliation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(client_id, month, year)
);

-- ============================================================================
-- 5. EXTRACTION CONFIDENCE TABLE (AI confidence tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS extraction_confidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  invoice_number_confidence DECIMAL(3, 2),
  invoice_date_confidence DECIMAL(3, 2),
  vendor_name_confidence DECIMAL(3, 2),
  vendor_gstin_confidence DECIMAL(3, 2),
  total_amount_confidence DECIMAL(3, 2),
  gst_amount_confidence DECIMAL(3, 2),
  hsn_code_confidence DECIMAL(3, 2),
  overall_confidence DECIMAL(3, 2),
  extraction_notes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. CLIENT INVITES TABLE (Invitation management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  invite_token VARCHAR(255) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, client_id)
);

-- ============================================================================
-- 7. ADMIN SETTINGS TABLE (Configuration storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. HSN TAX MAPPING TABLE (GST category reference)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hsn_tax_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hsn_code VARCHAR(10) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  gst_rate DECIMAL(5, 2) NOT NULL,
  is_exempt BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. RECONCILIATION RESULTS TABLE (Invoice reconciliation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reconciliation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  matched_gstr_2a_line_id UUID REFERENCES invoices(id),
  match_status VARCHAR(50) CHECK (match_status IN ('matched', 'partial', 'unmatched')) DEFAULT 'unmatched',
  variance_amount DECIMAL(15, 2),
  variance_gst DECIMAL(15, 2),
  reconciliation_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_gstin ON clients(gstin);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_pipeline_state ON invoices(pipeline_state);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_confidence_score ON invoices(confidence_score);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_client_id ON activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gst_summary_client_id ON gst_summary(client_id);
CREATE INDEX IF NOT EXISTS idx_gst_summary_period ON gst_summary(year, month);
CREATE INDEX IF NOT EXISTS idx_extraction_invoice_id ON extraction_confidence(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON client_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON client_invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON client_invites(status);
CREATE INDEX IF NOT EXISTS idx_hsn_code ON hsn_tax_mapping(hsn_code);
CREATE INDEX IF NOT EXISTS idx_hsn_category ON hsn_tax_mapping(category);
CREATE INDEX IF NOT EXISTS idx_hsn_gst_rate ON hsn_tax_mapping(gst_rate);
CREATE INDEX IF NOT EXISTS idx_reconciliation_invoice_id ON reconciliation_results(invoice_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON reconciliation_results(match_status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_created_at ON reconciliation_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_duplicate_check ON invoices(client_id, invoice_number, vendor_gstin, invoice_date, total_amount) WHERE status != 'rejected';
CREATE INDEX IF NOT EXISTS idx_invoices_vendor_date ON invoices(client_id, vendor_gstin, invoice_date) WHERE status != 'rejected';
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

-- Trigger function (create once)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (for re-deployment)
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
DROP TRIGGER IF EXISTS update_gst_summary_updated_at ON public.gst_summary;
DROP TRIGGER IF EXISTS update_extraction_confidence_updated_at ON public.extraction_confidence;
DROP TRIGGER IF EXISTS update_client_invites_updated_at ON public.client_invites;
DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON public.admin_settings;
DROP TRIGGER IF EXISTS update_hsn_tax_mapping_updated_at ON public.hsn_tax_mapping;
DROP TRIGGER IF EXISTS update_reconciliation_results_updated_at ON public.reconciliation_results;

-- Trigger for clients table
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices table
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gst_summary table
CREATE TRIGGER update_gst_summary_updated_at
BEFORE UPDATE ON public.gst_summary
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for extraction_confidence table
CREATE TRIGGER update_extraction_confidence_updated_at
BEFORE UPDATE ON public.extraction_confidence
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for client_invites table
CREATE TRIGGER update_client_invites_updated_at
BEFORE UPDATE ON public.client_invites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for admin_settings table
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for hsn_tax_mapping table
CREATE TRIGGER update_hsn_tax_mapping_updated_at
BEFORE UPDATE ON public.hsn_tax_mapping
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for reconciliation_results table
CREATE TRIGGER update_reconciliation_results_updated_at
BEFORE UPDATE ON public.reconciliation_results
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_confidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hsn_tax_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_results ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLIENTS TABLE RLS
-- ============================================================================
-- Users can view and edit their own clients
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- INVOICES TABLE RLS
-- ============================================================================
-- Users can view invoices for their clients
CREATE POLICY "Users can view invoices for their clients"
  ON invoices FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoices for their clients"
  ON invoices FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices for their clients"
  ON invoices FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- ACTIVITY LOG TABLE RLS
-- ============================================================================
-- Users can view activity for their clients
CREATE POLICY "Users can view activity logs for their clients"
  ON activity_log FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert activity logs"
  ON activity_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- GST SUMMARY TABLE RLS
-- ============================================================================
-- Users can view summaries for their clients
CREATE POLICY "Users can view GST summaries for their clients"
  ON gst_summary FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update GST summaries for their clients"
  ON gst_summary FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- EXTRACTION CONFIDENCE TABLE RLS
-- ============================================================================
-- Users can view extraction confidence for their invoices
CREATE POLICY "Users can view extraction confidence for their invoices"
  ON extraction_confidence FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- CLIENT INVITES TABLE RLS
-- ============================================================================
-- Users can view invites they created
CREATE POLICY "Users can view their created invites"
  ON client_invites FOR SELECT
  USING (created_by = auth.uid());

-- ============================================================================
-- HSN TAX MAPPING TABLE RLS
-- ============================================================================
-- Everyone can read HSN mappings (reference data)
CREATE POLICY "Everyone can read HSN tax mappings"
  ON hsn_tax_mapping FOR SELECT
  USING (true);

-- ============================================================================
-- RECONCILIATION RESULTS TABLE RLS
-- ============================================================================
-- Users can view reconciliation for their client's invoices
CREATE POLICY "Users can view reconciliation for their invoices"
  ON reconciliation_results FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- ADMIN SETTINGS TABLE RLS
-- ============================================================================
-- Everyone can read settings (non-sensitive)
CREATE POLICY "Everyone can read admin settings"
  ON admin_settings FOR SELECT
  USING (true);

-- ============================================================================
-- SEED DATA (Sample data for initial setup)
-- ============================================================================

-- Insert admin settings defaults
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
  ('confidence_threshold_auto_approve', '{"value": 0.95}', 'Invoices above this confidence are auto-approved'),
  ('confidence_threshold_review', '{"value": 0.80}', 'Invoices below 80% confidence require admin review'),
  ('default_invoice_retention_days', '{"value": 730}', 'Keep invoices for 2 years'),
  ('gemini_extraction_prompt', '{"version": 1, "model": "gpt-oss-20b"}', 'Configuration for OpenRouter extraction')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert common HSN codes (sample data - extend with full 5000+ codes)
INSERT INTO hsn_tax_mapping (hsn_code, category, description, gst_rate, is_exempt) VALUES
  ('8471', 'Electronics', 'Computers and data processing equipment', 18.00, false),
  ('8517', 'Electronics', 'Telephone, mobile phones, and parts', 18.00, false),
  ('8528', 'Electronics', 'TV, monitors, and projectors', 18.00, false),
  ('8443', 'Electronics', 'Printers, scanners, and copiers', 18.00, false),
  ('9018', 'Medical Equipment', 'Medical, surgical instruments', 12.00, false),
  ('3004', 'Pharmaceuticals', 'Medicaments (medicines)', 12.00, false),
  ('3003', 'Pharmaceuticals', 'Medicaments (excluding I.V. medicines)', 12.00, false),
  ('0701', 'Agriculture', 'Potatoes, fresh or chilled', 0.00, true),
  ('0702', 'Agriculture', 'Tomatoes, fresh or chilled', 0.00, true),
  ('0703', 'Agriculture', 'Onions, fresh or chilled', 0.00, true),
  ('1001', 'Agriculture', 'Wheat and meslin', 0.00, true),
  ('1006', 'Agriculture', 'Rice', 5.00, false),
  ('4901', 'Books', 'Printed books, brochures, leaflets', 0.00, true),
  ('4902', 'Newspapers', 'Newspapers, journals, periodicals', 0.00, true),
  ('2710', 'Petroleum', 'Petroleum oils and oils obtained from bituminous minerals', 5.00, false),
  ('8703', 'Automobiles', 'Motor cars and vehicles for passengers', 28.00, false),
  ('8704', 'Automobiles', 'Motor vehicles for transport of goods', 28.00, false),
  ('2203', 'Beverages', 'Beer made from malt', 28.00, false),
  ('2204', 'Beverages', 'Wine of fresh grapes', 28.00, false),
  ('2402', 'Tobacco', 'Cigars, cigarettes, tobacco', 28.00, false),
  ('9403', 'Furniture', 'Furniture and parts thereof', 18.00, false),
  ('6203', 'Textiles', 'Men or boys suits, trousers', 12.00, false),
  ('6204', 'Textiles', 'Women or girls suits, dresses', 12.00, false),
  ('6109', 'Textiles', 'T-shirts, singlets and vests', 5.00, false),
  ('2523', 'Construction', 'Portland cement, aluminous cement', 28.00, false),
  ('7214', 'Iron & Steel', 'Bars and rods, iron or steel', 18.00, false),
  ('9992', 'Services', 'IT and software services', 18.00, false),
  ('9993', 'Services', 'Consulting and professional services', 18.00, false),
  ('9994', 'Services', 'Construction services', 18.00, false),
  ('9995', 'Services', 'Restaurant and catering services', 5.00, false)
ON CONFLICT (hsn_code) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
