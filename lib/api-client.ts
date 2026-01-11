import { ApiResponse } from '@/lib/types/api'

// ============================================================================
// API CLIENT - Handles all HTTP requests with authentication
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface ApiClientOptions {
  headers?: Record<string, string>
  token?: string
  userId?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getHeaders(options?: ApiClientOptions): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add auth headers
    if (options?.token) {
      headers['Authorization'] = `Bearer ${options.token}`
    }

    if (options?.userId) {
      headers['x-user-id'] = options.userId
    }

    // Merge custom headers
    if (options?.headers) {
      Object.assign(headers, options.headers)
    }

    return headers
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit & ApiClientOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const { token, userId, headers, ...fetchOptions } = options

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: this.getHeaders({ token, userId, headers }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`)
      }

      return data as ApiResponse<T>
    } catch (error) {
      console.error(`API request failed (${endpoint}):`, error)
      throw error
    }
  }

  // Auth endpoints
  async register(email: string, password: string, fullName: string, phone?: string) {
    return this.request('auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, phone }),
    })
  }

  async login(email: string, password: string) {
    return this.request('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(options?: ApiClientOptions) {
    return this.request('auth/logout', {
      method: 'POST',
      ...options,
    })
  }

  // Client endpoints
  async getClients(options?: ApiClientOptions) {
    return this.request('admin/clients', {
      ...options,
    })
  }

  async createClient(data: any, options?: ApiClientOptions) {
    return this.request('admin/clients', {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  async getClient(id: string, options?: ApiClientOptions) {
    return this.request(`admin/clients/${id}`, {
      ...options,
    })
  }

  async updateClient(id: string, data: any, options?: ApiClientOptions) {
    return this.request(`admin/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
  }

  async deleteClient(id: string, options?: ApiClientOptions) {
    return this.request(`admin/clients/${id}`, {
      method: 'DELETE',
      ...options,
    })
  }

  // Invoice endpoints
  async getInvoices(params?: Record<string, any>, options?: ApiClientOptions) {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value))
        }
      })
    }

    const endpoint = query.toString() ? `invoices?${query.toString()}` : 'invoices'
    return this.request(endpoint, { ...options })
  }

  async createInvoice(data: any, options?: ApiClientOptions) {
    return this.request('invoices', {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  async approveInvoice(id: string, notes?: string, options?: ApiClientOptions) {
    return this.request(`invoices/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ review_notes: notes }),
      ...options,
    })
  }

  async rejectInvoice(id: string, notes: string, options?: ApiClientOptions) {
    return this.request(`invoices/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ review_notes: notes }),
      ...options,
    })
  }

  // Dashboard endpoints
  async getAdminDashboard(options?: ApiClientOptions) {
    return this.request('dashboard/admin', { ...options })
  }

  async getClientDashboard(options?: ApiClientOptions) {
    return this.request('dashboard/client', { ...options })
  }
}

export const apiClient = new ApiClient()
