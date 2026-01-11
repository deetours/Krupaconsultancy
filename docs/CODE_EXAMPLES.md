# Code Examples & Snippets

## 🔑 Authentication Examples

### Login Hook Usage
```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useLogin } from '@/hooks/use-api'
import { useState } from 'react'

export function LoginForm() {
  const router = useRouter()
  const { mutate: login, loading, error } = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await login({ email, password })
      if (result) {
        // Token automatically stored in localStorage
        router.push('/app')
      }
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="text-red-600">{error.message}</p>}
    </form>
  )
}
```

### Register Hook Usage
```typescript
import { useRegister } from '@/hooks/use-api'
import { useState } from 'react'

export function RegisterForm() {
  const { mutate: register, loading, error } = useRegister()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await register(formData)
      if (result?.success) {
        alert('Registration successful! Please login.')
      }
    } catch (err) {
      console.error('Registration failed:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      <input
        type="text"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        placeholder="Full Name"
      />
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Phone (optional)"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
```

---

## 📊 Data Fetching Examples

### Fetch Clients List
```typescript
'use client'

import { useClients } from '@/hooks/use-api'

export function ClientsList() {
  const { data: clients, loading, error } = useClients()

  if (loading) return <div>Loading clients...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!clients) return <div>No clients found</div>

  return (
    <ul>
      {clients.map((client) => (
        <li key={client.id}>
          {client.business_name} ({client.gstin})
        </li>
      ))}
    </ul>
  )
}
```

### Fetch Invoices with Filters
```typescript
import { useInvoices } from '@/hooks/use-api'
import { useState } from 'react'

export function InvoicesList() {
  const [clientId, setClientId] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const { data, loading, error, refetch } = useInvoices(clientId, status)

  return (
    <div>
      <div className="filters">
        <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">All Clients</option>
          {/* Add client options */}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button onClick={() => refetch()}>Refresh</button>
      </div>

      {loading && <p>Loading invoices...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {data && (
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {data.invoices?.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.invoice_number}</td>
                <td>{inv.vendor_name}</td>
                <td>₹{inv.total_amount}</td>
                <td>{inv.status}</td>
                <td>{(inv.confidence_score * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

### Fetch Admin Dashboard
```typescript
import { useAdminDashboard } from '@/hooks/use-api'

export function AdminDashboard() {
  const { data, loading, error } = useAdminDashboard()

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card
        title="Processed Today"
        value={data?.totalProcessed}
        icon="✓"
      />
      <Card
        title="Auto-Approved"
        value={data?.autoApprovedToday}
        icon="✓"
      />
      <Card
        title="Needs Review"
        value={data?.needsReview}
        icon="⚠"
      />
      <Card
        title="Avg Confidence"
        value={`${data?.averageConfidence.toFixed(1)}%`}
        icon="📊"
      />

      <AttentionQueue invoices={data?.attentionQueue} />
    </div>
  )
}
```

---

## 📤 File Upload Examples

### Single File Upload
```typescript
'use client'

import { useFileUpload } from '@/hooks/use-file-upload'
import { useState } from 'react'

export function FileUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { upload, uploading, progress, error } = useFileUpload({
    bucket: 'invoices',
    onProgress: (p) => console.log(`${p}% done`),
    onSuccess: (result) => {
      alert(`File uploaded: ${result.fileName}`)
      setSelectedFile(null)
    },
    onError: (err) => alert(`Upload failed: ${err}`),
  })

  const handleUpload = async () => {
    if (!selectedFile) return
    await upload(selectedFile)
  }

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        accept=".pdf,.jpg,.png,.xlsx"
      />

      {selectedFile && <p>Selected: {selectedFile.name}</p>}

      <button onClick={handleUpload} disabled={uploading || !selectedFile}>
        {uploading ? `Uploading ${progress}%...` : 'Upload'}
      </button>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  )
}
```

### Multiple File Upload
```typescript
import { useMultipleFileUpload } from '@/hooks/use-file-upload'

export function MultiUploader() {
  const [files, setFiles] = useState<File[]>([])
  const { uploadMultiple, uploading, progress, errors, results } = 
    useMultipleFileUpload({
      bucket: 'invoices',
    })

  const handleUploadAll = async () => {
    await uploadMultiple(files)
    setFiles([])
  }

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />

      <button onClick={handleUploadAll} disabled={uploading}>
        Upload {files.length} Files
      </button>

      {Object.entries(progress).map(([name, prog]) => (
        <div key={name}>
          <p>{name}: {prog}%</p>
        </div>
      ))}

      {Object.entries(errors).map(([name, err]) => (
        <p key={name} className="text-red-600">
          {name}: {err}
        </p>
      ))}
    </div>
  )
}
```

---

## 🔧 CRUD Operations Examples

### Create Client
```typescript
import { useCreateClient } from '@/hooks/use-api'
import { useState } from 'react'

export function CreateClientForm() {
  const { mutate: createClient, loading, error } = useCreateClient()
  const [formData, setFormData] = useState({
    gstin: '',
    business_name: '',
    contact_email: '',
    city: '',
    state: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await createClient(formData)
      if (result) {
        alert(`Client created: ${result.business_name}`)
        setFormData({
          gstin: '',
          business_name: '',
          contact_email: '',
          city: '',
          state: '',
        })
      }
    } catch (err) {
      console.error('Failed to create client:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="GSTIN (15 chars)"
        maxLength={15}
        value={formData.gstin}
        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Business Name"
        value={formData.business_name}
        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.contact_email}
        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
      />
      <input
        type="text"
        placeholder="City"
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
      />
      <input
        type="text"
        placeholder="State"
        value={formData.state}
        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Client'}
      </button>

      {error && <p className="text-red-600">{error.message}</p>}
    </form>
  )
}
```

### Approve Invoice
```typescript
import { useApproveInvoice } from '@/hooks/use-api'
import { useState } from 'react'

export function ApproveInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const { mutate: approve, loading } = useApproveInvoice()
  const [notes, setNotes] = useState('')

  const handleApprove = async () => {
    try {
      const result = await approve({
        id: invoiceId,
        notes,
      })
      if (result) {
        alert('Invoice approved!')
        setNotes('')
      }
    } catch (err) {
      console.error('Failed to approve:', err)
    }
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Approval notes (optional)"
      />
      <button onClick={handleApprove} disabled={loading}>
        {loading ? 'Approving...' : 'Approve'}
      </button>
    </div>
  )
}
```

### Reject Invoice
```typescript
import { useRejectInvoice } from '@/hooks/use-api'
import { useState } from 'react'

export function RejectInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const { mutate: reject, loading } = useRejectInvoice()
  const [notes, setNotes] = useState('')

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please provide rejection reason')
      return
    }

    try {
      const result = await reject({
        id: invoiceId,
        notes,
      })
      if (result) {
        alert('Invoice rejected')
        setNotes('')
      }
    } catch (err) {
      console.error('Failed to reject:', err)
    }
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Reason for rejection (required)"
        required
      />
      <button onClick={handleReject} disabled={loading || !notes.trim()}>
        {loading ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  )
}
```

---

## 🔐 Protected Component Example

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useClients } from '@/hooks/use-api'

export function ProtectedDashboard() {
  const router = useRouter()
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  const { data: clients, loading } = useClients()

  useEffect(() => {
    // Redirect if not authenticated
    if (!userId) {
      router.push('/login')
    }
  }, [userId, router])

  if (!userId) {
    return <div>Redirecting to login...</div>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Clients: {clients?.length}</p>
    </div>
  )
}
```

---

## 🧪 Testing Examples

### Test API Client
```typescript
import { apiClient } from '@/lib/api-client'

// Test login
const loginResult = await apiClient.login(
  'test@example.com',
  'password123'
)
console.log('Login token:', loginResult.data.token)

// Test get clients
const clientsResult = await apiClient.getClients({
  token: 'your_token',
  userId: 'your_user_id'
})
console.log('Clients:', clientsResult.data)
```

### Test Storage Client
```typescript
import { storageClient } from '@/lib/storage-client'

// Upload file
const result = await storageClient.uploadFile(file, {
  bucket: 'invoices',
  folder: 'client_id_123',
})
console.log('Upload result:', result)

// Get signed URL
const url = await storageClient.getSignedUrl(
  result.filePath,
  'invoices'
)
console.log('Download URL:', url)
```
