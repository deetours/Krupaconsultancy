# ✅ AI Extraction - Quick Start Testing Checklist

## Pre-Flight (Setup)

- [x] OpenRouter API key added to `.env.local`
- [x] Database schema deployed to Supabase
- [x] Project builds successfully (16.5s)
- [x] All 19 API routes compiled
- [x] AI extraction service created
- [x] Confidence scoring implemented
- [x] Auto-approval logic ready

---

## Test Phase 1: Basic Setup (5 minutes)

- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Homepage loads ✓
- [ ] About page accessible ✓
- [ ] Contact page accessible ✓

---

## Test Phase 2: Authentication (5 minutes)

- [ ] Navigate to /login
- [ ] Click "No account? Register" → /register works
- [ ] Register new user
  - Email: `test@example.com`
  - Password: `TestPass123`
  - Full Name: Test User
  - Phone: 9876543210
- [ ] Receive confirmation ✓
- [ ] Login with new account
  - Should redirect to /app
  - Token stored in localStorage

---

## Test Phase 3: Client Setup (5 minutes)

- [ ] On /app dashboard
- [ ] Create a new client:
  - Business Name: "Test GST Pvt Ltd"
  - GSTIN: `29AABCU9603R1ZM` (valid format)
  - Email: `client@test.com`
  - Phone: `9876543210`
- [ ] Client appears in list ✓
- [ ] Can view client details ✓

---

## Test Phase 4: Invoice Upload (5 minutes)

- [ ] Still on /app dashboard
- [ ] Click "Upload Invoice" button
- [ ] Upload a PDF/image file:
  - JPG or PNG recommended
  - Size: <50MB
  - Contains invoice data (text/numbers)
- [ ] File uploads successfully ✓
- [ ] Invoice appears in list ✓
- [ ] Status shows "pending" (awaiting extraction)

---

## Test Phase 5: AI Extraction (10 minutes)

**Option A: Manual API Call**

```bash
# 1. Get your JWT token from browser
# Open DevTools → Application → localStorage → token

# 2. Get invoice ID from list
# Or check network tab in DevTools

# 3. Convert image to base64 (Windows PowerShell):
$imageBytes = [System.IO.File]::ReadAllBytes("C:\path\to\invoice.jpg")
$base64 = [System.Convert]::ToBase64String($imageBytes)
Write-Output $base64

# 4. Call extraction API:
curl -X POST http://localhost:3000/api/ai/extract \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "x-user-id: YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "INVOICE_UUID",
    "fileBase64": "iVBORw0KGgo...",
    "fileName": "invoice.jpg",
    "userId": "YOUR_USER_ID"
  }'

# 5. Check response:
# Should see extracted data + confidence scores
```

**Option B: Via Frontend** (if implemented)
- [ ] Add "Extract" button to invoice item
- [ ] Click button → Calls AI extraction
- [ ] Shows extracted data
- [ ] Updates confidence score

---

## Test Phase 6: Verify Results (5 minutes)

After extraction completes:

- [ ] Invoice status updated:
  - ≥0.95 confidence → "approved"
  - 0.80-0.95 confidence → "review"
  - <0.80 confidence → "rejected"
- [ ] Extracted data visible:
  - Invoice number
  - Vendor GSTIN
  - Total amount
  - GST amount
  - HSN code
- [ ] Confidence score displayed (0-100%)
- [ ] Field-level confidence shown

---

## Test Phase 7: Admin Features (5 minutes)

**Admin Registration (if needed):**

1. Register as admin (change role manually in DB):
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
```

2. Login as admin

3. Access attention queue:
```bash
curl -X GET http://localhost:3000/api/admin/attention-queue \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "x-user-id: ADMIN_USER_ID"
```

Expected response:
```json
{
  "success": true,
  "total": 1,
  "review_queue": 1,
  "low_confidence": 0,
  "pending": 0,
  "items": [
    {
      "id": "...",
      "invoice_number": "INV-001",
      "client_name": "Test GST Pvt Ltd",
      "confidence_score": 0.85,
      "status": "review",
      "reason": "Confidence: 85% - Requires admin review"
    }
  ]
}
```

- [ ] Attention queue returns correct data ✓
- [ ] Low-confidence invoices listed ✓
- [ ] Pending extractions shown ✓

---

## Test Phase 8: Approval/Rejection (5 minutes)

**Approve Invoice:**

```bash
curl -X POST http://localhost:3000/api/invoices/{invoice_id}/approve \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "x-user-id: USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Approved by admin"
  }'
```

Expected: Status changes to "approved"

- [ ] Invoice marked as approved ✓
- [ ] Activity logged ✓
- [ ] GST summary updated ✓

**Reject Invoice:**

```bash
curl -X POST http://localhost:3000/api/invoices/{invoice_id}/reject \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "x-user-id: USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Invoice format issue - please resubmit"
  }'
```

Expected: Status changes to "rejected"

- [ ] Invoice marked as rejected ✓
- [ ] Reason stored ✓
- [ ] Activity logged ✓

---

## Test Phase 9: Database Verification (5 minutes)

In Supabase SQL Editor, verify data:

```sql
-- Check invoices
SELECT id, invoice_number, status, confidence_score 
FROM invoices 
ORDER BY created_at DESC 
LIMIT 5;

-- Check extraction confidence
SELECT field_name, confidence_score, created_at 
FROM extraction_confidence 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Check activity log
SELECT action, entity_type, created_at 
FROM activity_log 
WHERE action LIKE '%extract%' OR action LIKE '%approv%'
ORDER BY created_at DESC 
LIMIT 10;

-- Check GST summary
SELECT client_id, month, year, total_approved, total_pending 
FROM gst_summary 
ORDER BY created_at DESC 
LIMIT 5;
```

- [ ] Invoices table has extracted_data (JSON) ✓
- [ ] Confidence scores recorded (0-1) ✓
- [ ] Status correctly updated ✓
- [ ] Activity log shows all actions ✓
- [ ] extraction_confidence table populated ✓

---

## Test Phase 10: Edge Cases (10 minutes)

### Test Low Confidence Invoice

Upload a blurry or poor-quality image:
- [ ] Extraction completes
- [ ] Confidence <0.80 ✓
- [ ] Status set to "rejected" ✓
- [ ] Activity log shows reason ✓

### Test Invalid GSTIN

If extraction returns invalid GSTIN (not 15 chars):
- [ ] System rejects GSTIN value ✓
- [ ] Sets it to null ✓
- [ ] Lowers confidence score ✓

### Test Missing Fields

If invoice missing critical data:
- [ ] Missing field set to null ✓
- [ ] Confidence reduced for missing field ✓
- [ ] Overall confidence reflects missing data ✓

### Test Rate Limiting

If hitting OpenRouter rate limit:
- [ ] Returns 429 error ✓
- [ ] Invoice stays in pending ✓
- [ ] User can retry ✓

---

## Success Criteria

Your system is working if:

✅ Users can register & login  
✅ Users can create clients  
✅ Users can upload invoices  
✅ AI extracts invoice data successfully  
✅ Confidence scores calculated & stored  
✅ Auto-approval works (≥0.95 confidence)  
✅ Admin attention queue shows correct data  
✅ Approval/rejection workflows function  
✅ All actions logged in activity_log  
✅ Database correctly stores extracted data  

---

## Troubleshooting

### OpenRouter Returns Error
- [ ] Check API key in `.env.local`
- [ ] Verify internet connection
- [ ] Check OpenRouter status page

### Confidence Score Not Updating
- [ ] Verify invoice record exists in DB
- [ ] Check API response has extracted data
- [ ] Verify function returning numeric score

### Auto-Approval Not Triggering
- [ ] Check confidence_score in database
- [ ] Verify it's ≥0.95
- [ ] Check activity_log for approval record

### Attention Queue Empty
- [ ] Create invoice with 0.80-0.95 confidence
- [ ] Check invoice status = 'review'
- [ ] Verify user is admin role

---

## Next Steps After Testing

✅ **Phase Complete:** Extraction & Confidence Scoring Working

**Move to Phase 2:**
1. Deploy to Vercel
2. Test with real client invoices
3. Monitor confidence scores
4. Fine-tune thresholds if needed
5. Proceed to WhatsApp/Email notifications

---

**Created:** 2026-01-12  
**Version:** 1.0  
**Status:** Ready for Testing
