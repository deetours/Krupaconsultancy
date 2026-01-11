# Krupa Consultancy API Documentation

## Overview

Complete REST API for GST automation platform with authentication, client management, and invoice processing.

**Base URL:** `http://localhost:3000/api` (development)

**Authentication:** All endpoints require `x-user-id` header with the user's UUID

---

## Authentication Endpoints

### 1. Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe",
  "phone": "+91-9999999999" // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+91-9999999999",
    "role": "client",
    "status": "active",
    "created_at": "2026-01-12T...",
    "updated_at": "2026-01-12T..."
  },
  "message": "Registration successful"
}
```

**Error Responses:**
- `400` - Validation error (email invalid, password too short, etc.)
- `400` - Email already registered

---

### 2. Login User

**POST** `/auth/login`

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "client",
      "status": "active",
      "last_login": "2026-01-12T..."
    },
    "token": "token_string_32_chars"
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `401` - Invalid email or password

---

### 3. Logout User

**POST** `/auth/logout`

Logout user (client-side should clear token from localStorage).

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

---

## Client Management Endpoints

All client endpoints require `x-user-id` header.

### 1. List Clients

**GET** `/admin/clients`

Get all clients belonging to the user.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "gstin": "27AAFCU5055K1ZO",
      "business_name": "ABC Enterprise Ltd",
      "contact_email": "contact@abc.com",
      "contact_phone": "+91-9999999999",
      "status": "active",
      "address_line1": "123 Business Park",
      "city": "Bangalore",
      "state": "Karnataka",
      "postal_code": "560001",
      "created_at": "2026-01-12T...",
      "updated_at": "2026-01-12T..."
    }
  ]
}
```

---

### 2. Create Client

**POST** `/admin/clients`

Add a new GST client.

**Request Body:**
```json
{
  "gstin": "27AAFCU5055K1ZO",
  "business_name": "ABC Enterprise Ltd",
  "contact_email": "contact@abc.com",
  "contact_phone": "+91-9999999999",
  "address_line1": "123 Business Park",
  "address_line2": "Building A",
  "city": "Bangalore",
  "state": "Karnataka",
  "postal_code": "560001"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "gstin": "27AAFCU5055K1ZO",
    "business_name": "ABC Enterprise Ltd",
    "status": "active",
    "created_at": "2026-01-12T..."
  },
  "message": "Client created successfully"
}
```

**Error Responses:**
- `400` - Invalid GSTIN format
- `400` - GSTIN already registered

---

### 3. Get Single Client

**GET** `/admin/clients/:id`

Get specific client details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "gstin": "27AAFCU5055K1ZO",
    "business_name": "ABC Enterprise Ltd",
    // ... full client object
  }
}
```

**Error Responses:**
- `404` - Client not found

---

### 4. Update Client

**PUT** `/admin/clients/:id`

Update client information.

**Request Body:** (all fields optional)
```json
{
  "business_name": "ABC Enterprise Pvt Ltd",
  "contact_email": "newemail@abc.com",
  "contact_phone": "+91-8888888888",
  "city": "Chennai"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_name": "ABC Enterprise Pvt Ltd",
    "contact_email": "newemail@abc.com",
    // ... updated fields
  },
  "message": "Client updated successfully"
}
```

---

### 5. Delete Client

**DELETE** `/admin/clients/:id`

Remove a client (cascades to invoices).

**Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Client deleted successfully"
}
```

---

## Invoice Management Endpoints

All invoice endpoints require `x-user-id` header.

### 1. List Invoices

**GET** `/invoices`

Get invoices for user's clients with filtering and pagination.

**Query Parameters:**
- `client_id` (optional) - Filter by specific client
- `status` (optional) - Filter by status (pending, review, approved, rejected)
- `limit` (optional, default: 50) - Number of records per page
- `offset` (optional, default: 0) - Pagination offset

**Example:**
```
GET /invoices?client_id=uuid&status=pending&limit=10&offset=0
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "uuid",
        "client_id": "uuid",
        "file_name": "invoice_001.pdf",
        "file_path": "invoices/client_id/2026/01/invoice_001.pdf",
        "invoice_number": "INV-2026-001",
        "invoice_date": "2026-01-10",
        "vendor_name": "Vendor Corp",
        "vendor_gstin": "27AAFCU5055K1ZO",
        "total_amount": 50000.00,
        "gst_amount": 9000.00,
        "hsn_code": "998399",
        "extracted_data": {},
        "confidence_score": 0.95,
        "status": "pending",
        "review_notes": null,
        "created_at": "2026-01-12T..."
      }
    ],
    "count": 45,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 2. Create Invoice Entry

**POST** `/invoices`

Create invoice record after file upload to Supabase Storage.

**Request Body:**
```json
{
  "client_id": "uuid",
  "file_name": "invoice_001.pdf",
  "file_path": "invoices/client_id/2026/01/invoice_001.pdf",
  "file_size": 245632
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "client_id": "uuid",
    "file_name": "invoice_001.pdf",
    "status": "pending",
    "created_at": "2026-01-12T..."
  },
  "message": "Invoice created successfully"
}
```

---

### 3. Approve Invoice

**POST** `/invoices/:id/approve`

Approve invoice after review.

**Request Body:**
```json
{
  "review_notes": "Approved - all details verified" // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "approved_by": "user_uuid",
    "approved_at": "2026-01-12T...",
    "review_notes": "Approved - all details verified"
  },
  "message": "Invoice approved successfully"
}
```

---

### 4. Reject Invoice

**POST** `/invoices/:id/reject`

Reject invoice with reason.

**Request Body:**
```json
{
  "review_notes": "GSTIN mismatch - vendor GSTIN doesn't match records" // required
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "rejected",
    "review_notes": "GSTIN mismatch - vendor GSTIN doesn't match records"
  },
  "message": "Invoice rejected successfully"
}
```

**Error Responses:**
- `400` - Review notes required for rejection
- `404` - Invoice not found

---

## Dashboard Endpoints

### 1. Admin Dashboard Data

**GET** `/dashboard/admin`

Get admin overview statistics (requires admin role).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProcessed": 156,
    "autoApprovedToday": 142,
    "needsReview": 8,
    "rejectedToday": 2,
    "averageConfidence": 94.2,
    "attentionQueue": [
      {
        "id": "uuid",
        "invoice_number": "INV-2026-015",
        "vendor_name": "Unknown Vendor",
        "total_amount": 25000,
        "confidence_score": 0.72,
        "status": "pending"
      }
    ]
  }
}
```

**Error Responses:**
- `403` - Admin access required

---

### 2. Client Dashboard Data

**GET** `/dashboard/client`

Get client portal overview statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "uuid",
        "gstin": "27AAFCU5055K1ZO",
        "business_name": "ABC Enterprise Ltd",
        "status": "active"
      }
    ],
    "totalClients": 5,
    "activeClients": 4,
    "status": "healthy",
    "recentInvoices": [],
    "totalInvoices": 42,
    "averageConfidence": 91.5
  }
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Implementation Notes

### Authentication Header

All endpoints except `/auth/register` and `/auth/login` require:

```
x-user-id: {user_uuid}
```

### Activity Logging

All create/update/delete operations automatically log to `activity_log` table with:
- User ID
- Action type (user_registered, client_created, invoice_approved, etc.)
- Entity type and ID
- Old and new values
- IP address
- User agent

### Pagination

List endpoints support pagination:
- `limit`: Max records to return (default: 50)
- `offset`: Number of records to skip (default: 0)

Example: `/invoices?limit=20&offset=40` returns records 41-60

### Row-Level Security

All queries are automatically scoped to user's own data via RLS policies:
- Clients: Only user's own clients
- Invoices: Only invoices from user's clients
- Activity: Only user's own activity

---

## Next Steps

1. **Deploy schema** to Supabase using SQL editor
2. **Test endpoints** using Postman/curl with `x-user-id` header
3. **Connect frontend** to use these APIs
4. **Implement file upload** to Supabase Storage
5. **Add AI extraction** (Gemini for OCR)
6. **Add email notifications** for approvals/rejections

---

## Testing Commands

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Login user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# List clients (requires x-user-id header)
curl -X GET http://localhost:3000/api/admin/clients \
  -H "x-user-id: user-uuid-here"

# Create client
curl -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-uuid-here" \
  -d '{
    "gstin": "27AAFCU5055K1ZO",
    "business_name": "ABC Enterprise"
  }'
```
