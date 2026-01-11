# Supabase Setup Guide for Krupa Consultancy GST App

## ✅ COMPLETED SETUP

### 1. Environment Configuration
- ✅ `.env.local` created with credentials
- ✅ Supabase project URL: `https://cqvkeejqmegisyjgqgrm.supabase.co`
- ✅ Anon Key configured
- ✅ Service Role Key configured

### 2. Client Libraries Installed
- ✅ `@supabase/supabase-js` installed
- ✅ Browser client created at `/lib/supabase/client.ts`
- ✅ Server client created at `/lib/supabase/server.ts`
- ✅ Admin client created at `/lib/supabase/admin.ts`

### 3. Project Structure
```
lib/supabase/
├── client.ts      (Browser client for use in components)
├── server.ts      (Server component client)
└── admin.ts       (Admin operations with service role key)

app/api/
├── test/          (Test endpoint to verify connection)
└── [other API routes to be created]

db/
└── schema.sql     (Complete database schema)
```

## 🔧 NEXT STEPS: Deploy Database Schema

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select project: `cqvkeejqmegisyjgqgrm`
3. Navigate to: SQL Editor → New Query

### Step 2: Deploy Schema
1. Open `/db/schema.sql` from the repository
2. Copy the entire SQL schema
3. Paste into Supabase SQL Editor
4. Click "Run" to execute

**What gets created:**
- 8 tables: users, clients, invoices, activity_log, gst_summary, extraction_confidence, client_invites, admin_settings
- Indexes for performance optimization
- Row-Level Security (RLS) policies for data protection
- Triggers for automatic `updated_at` timestamps

### Step 3: Create Storage Buckets
1. In Supabase Dashboard → Storage
2. Create bucket: `invoices`
   - Make **Private** (access via signed URLs)
   - Allow file types: `pdf, jpg, png, jpeg, xlsx, xls`
3. Create bucket: `documents`
   - Make **Private** (access via signed URLs)
   - Allow file types: `pdf, docx, xlsx`

### Step 4: Configure RLS Policies for Storage
1. Go to Storage → invoices bucket → Policies
2. Create policy: "Users can upload to their folder"
   ```sql
   (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1])
   ```

## 🧪 Verify Connection

Run the test endpoint to confirm everything is working:

```bash
npm run dev
# Visit: http://localhost:3000/api/test
```

Expected response:
```json
{
  "success": true,
  "message": "Supabase connection successful",
  "timestamp": "2026-01-12T..."
}
```

## 📋 Database Schema Summary

### Tables Created:

1. **users** - Authentication & admin/client roles
   - id, email, phone, full_name, password_hash, role, status, created_at, updated_at, last_login

2. **clients** - GST registrations
   - id, user_id, gstin, business_name, contact_email, contact_phone, address fields, status

3. **invoices** - Uploaded invoices & extraction data
   - id, client_id, file_name, file_path, invoice_number, vendor_name, total_amount, gst_amount
   - extracted_data (JSONB), confidence_score, status, approval fields

4. **activity_log** - Audit trail
   - id, user_id, client_id, action, entity_type, old_values, new_values, ip_address, user_agent

5. **gst_summary** - Monthly reconciliation
   - id, client_id, month, year, total_invoices, total_taxable_amount, total_gst, status fields

6. **extraction_confidence** - AI quality tracking
   - id, invoice_id, field_name, confidence_score, extracted_value, validated_value, correction fields

7. **client_invites** - Registration flow
   - id, email, invite_token, gstin, status, created_by, expires_at, accepted_at

8. **admin_settings** - System configuration
   - id, setting_key, setting_value (JSONB), description, updated_by, updated_at

## 🔒 Security Features

- **Row-Level Security (RLS)** enabled on all tables
- **Clients** can only see their own data
- **Activity logs** track all changes with IP & user agent
- **Service role key** stored securely (never in client code)
- **Anon key** scoped to minimum permissions

## 📊 Indexes Created

Optimized query performance with indexes on:
- users.email, users.role
- clients.user_id, clients.gstin, clients.status
- invoices.client_id, invoices.status, invoices.created_at, invoices.confidence_score
- activity_log.user_id, activity_log.client_id, activity_log.created_at
- gst_summary.client_id, gst_summary (year, month)
- And more...

## 🚀 Ready for API Development

After schema deployment, you're ready to build:
1. ✅ Authentication API routes
2. ✅ Invoice upload & processing endpoints
3. ✅ Admin CRUD operations
4. ✅ AI extraction integration
5. ✅ Real-time activity logging

All with full database support and RLS security!
