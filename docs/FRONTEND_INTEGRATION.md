# Frontend Integration Guide

## ✅ Completed Integrations

### 1. API Client (`/lib/api-client.ts`)
- Centralized HTTP client with authentication
- All endpoints mapped (auth, clients, invoices, dashboard)
- Automatic header management (token, userId)
- Error handling and logging

**Usage:**
```typescript
import { apiClient } from '@/lib/api-client'

// Use with auth headers
const response = await apiClient.getClients({
  token: "user_token",
  userId: "user_uuid"
})
```

### 2. Storage Client (`/lib/storage-client.ts`)
- Supabase file upload handling
- File validation (type, size)
- Signed URL generation
- File deletion and listing
- Auto-retry on failure

**Usage:**
```typescript
import { handleFileUpload } from '@/lib/storage-client'

const result = await handleFileUpload(file, 'invoices', clientId)
// Returns: { success: boolean, filePath, fileName, fileSize, error? }
```

### 3. Custom Hooks (`/hooks/use-api.ts`)
- **useClients()** - Fetch user's clients (refetch every 60s)
- **useInvoices(clientId?, status?)** - Fetch invoices with filters
- **useAdminDashboard()** - Admin stats (refetch every 15s)
- **useClientDashboard()** - Client stats (refetch every 30s)
- **useCreateClient()** - Create new client
- **useUpdateClient(id)** - Update client
- **useDeleteClient()** - Delete client
- **useCreateInvoice()** - Create invoice
- **useApproveInvoice()** - Approve invoice
- **useRejectInvoice()** - Reject invoice
- **useLogin()** - Login & store token/userId in localStorage
- **useRegister()** - Register new user
- **useLogout()** - Logout & clear localStorage

**Usage:**
```typescript
'use client'

import { useClients, useCreateClient } from '@/hooks/use-api'

export function MyComponent() {
  const { data: clients, loading, error } = useClients()
  const { mutate: createClient, loading: creating } = useCreateClient()

  return (
    <div>
      {loading ? 'Loading...' : `Found ${clients?.length} clients`}
    </div>
  )
}
```

### 4. File Upload Hook (`/hooks/use-file-upload.ts`)
- **useFileUpload(options)** - Single file upload
- **useMultipleFileUpload(options)** - Batch uploads
- Progress tracking
- Error handling

**Usage:**
```typescript
const { upload, uploading, error, progress } = useFileUpload({
  bucket: 'invoices',
  folder: 'client_id',
  onProgress: (p) => console.log(`${p}% done`),
  onSuccess: (result) => console.log(result),
  onError: (err) => console.error(err),
})

// Upload file
const result = await upload(file)
```

### 5. Updated Pages

#### `/app/login/page.tsx`
- ✅ Real authentication with API
- ✅ Token/userId stored in localStorage
- ✅ Error display
- ✅ Redirects to `/app` on success

#### `/app/app/page.tsx` (Customer Dashboard)
- ✅ Real data from API
- ✅ File upload to Supabase Storage
- ✅ Invoice list from database
- ✅ Activity timeline from real data
- ✅ Loading states and error handling

---

## 🔐 Authentication Flow

1. User logs in with email/password
2. API validates credentials
3. Returns `{ user, token }`
4. Frontend stores in localStorage:
   - `token` - JWT token for auth header
   - `userId` - User UUID for x-user-id header
   - `user` - User object (email, name, role)
5. All subsequent requests include both headers

**Check auth in components:**
```typescript
useEffect(() => {
  const userId = localStorage.getItem('userId')
  if (!userId) {
    router.push('/login')
  }
}, [])
```

---

## 📤 File Upload Flow

1. User selects file
2. `handleFileUpload()` validates file type/size
3. Uploads to Supabase Storage (path: `/year/month/filename.ext`)
4. Creates invoice record in database via API
5. Returns file info and invoice ID
6. Frontend shows in list with real data

**Storage bucket structure:**
```
invoices/
├── 2026/
│   ├── 01/
│   │   ├── abc123-invoice1.pdf
│   │   └── def456-invoice2.pdf
│   └── 02/
└── documents/
```

---

## 🪝 Hook Patterns

### Query Hook (Read Data)
```typescript
const { data, loading, error, refetch } = useClients()

// Auto-refetches every 60 seconds
// Handles auth headers automatically
// Error states built-in
```

### Mutation Hook (Write Data)
```typescript
const { mutate, loading, error, data } = useCreateClient()

try {
  const result = await mutate({
    gstin: "27AAFCU5055K1ZO",
    business_name: "ABC Corp"
  })
} catch (err) {
  console.error(err.message)
}
```

---

## 🔌 Real API Endpoints Used

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login & get token
- `POST /auth/logout` - Logout
- `GET /admin/clients` - List clients
- `POST /admin/clients` - Create client
- `GET /admin/clients/:id` - Get client
- `PUT /admin/clients/:id` - Update client
- `DELETE /admin/clients/:id` - Delete client
- `GET /invoices` - List invoices (with pagination)
- `POST /invoices` - Create invoice entry
- `POST /invoices/:id/approve` - Approve invoice
- `POST /invoices/:id/reject` - Reject invoice
- `GET /dashboard/admin` - Admin stats
- `GET /dashboard/client` - Client stats

---

## 🚀 Next Steps

### Phase 2: AI Integration
1. Create `/api/ai/extract` endpoint
2. Call Gemini 1.5 Pro for OCR
3. Extract invoice fields automatically
4. Calculate confidence scores
5. Auto-approve high-confidence invoices

### Phase 3: Admin Dashboard
1. Update `/app/admin/page.tsx` with real data
2. Connect to AttentionQueue API
3. Implement approve/reject workflows
4. Real-time updates

### Phase 4: Notifications
1. Email notifications for approvals
2. WhatsApp notifications
3. Activity digest emails
4. Invoice status updates

### Phase 5: Email Invites
1. Create invite flow
2. Send registration links
3. Accept invite & auto-register
4. Setup client onboarding

---

## 🐛 Debugging

### Check localStorage
```javascript
// In browser console
console.log(localStorage.getItem('token'))
console.log(localStorage.getItem('userId'))
console.log(JSON.parse(localStorage.getItem('user')))
```

### Check API calls
```javascript
// Open DevTools Network tab
// All requests show full headers and response
```

### Test API endpoint directly
```bash
curl -X GET http://localhost:3000/api/admin/clients \
  -H "x-user-id: YOUR_UUID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Current Status

✅ **Completed:**
- API client with all endpoints
- File upload to Supabase Storage
- Custom hooks for data fetching
- Login page with real authentication
- Customer dashboard with real data
- Authentication token management
- Activity logging

🟡 **In Progress:**
- Database schema deployment
- Admin dashboard real data
- File upload in FileUploadZone component
- Invoice approval workflows

⏳ **Upcoming:**
- AI extraction (Gemini)
- Confidence scoring
- Auto-approval logic
- Email notifications
- Admin workflows
