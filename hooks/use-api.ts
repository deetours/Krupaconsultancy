'use client'

import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { ApiResponse } from '@/lib/types/api'

// ============================================================================
// CUSTOM HOOKS FOR API DATA FETCHING
// ============================================================================

interface UseQueryOptions {
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

interface UseQueryReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

interface UseMutationReturn<T> {
  mutate: (variables: any) => Promise<T | null>
  loading: boolean
  error: Error | null
  data: T | null
}

// Get authentication from localStorage
function getAuthHeaders() {
  if (typeof window === 'undefined') return {}

  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')

  return { token, userId }
}

/**
 * Generic query hook for fetching data
 */
export function useQuery<T = any>(
  queryFn: (options: any) => Promise<ApiResponse<T>>,
  options: UseQueryOptions = {}
): UseQueryReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const enabled = options.enabled !== false

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const authHeaders = getAuthHeaders()
      const response = await queryFn(authHeaders)

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch data')
      }

      setData(response.data || null)
      options.onSuccess?.(response.data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [enabled, queryFn, options])

  useEffect(() => {
    fetchData()

    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, options.refetchInterval])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Hook for fetching invoices
 */
export function useInvoices(clientId?: string, status?: string) {
  return useQuery(
    async (authHeaders) => {
      return apiClient.getInvoices(
        {
          client_id: clientId,
          status,
          limit: 50,
        },
        authHeaders
      )
    },
    {
      enabled: true,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )
}

/**
 * Hook for fetching clients
 */
export function useClients() {
  return useQuery(
    async (authHeaders) => {
      return apiClient.getClients(authHeaders)
    },
    {
      enabled: true,
      refetchInterval: 60000, // Refetch every 60 seconds
    }
  )
}

/**
 * Hook for fetching admin dashboard data
 */
export function useAdminDashboard() {
  return useQuery(
    async (authHeaders) => {
      return apiClient.getAdminDashboard(authHeaders)
    },
    {
      enabled: true,
      refetchInterval: 15000, // Refetch every 15 seconds
    }
  )
}

/**
 * Hook for fetching client dashboard data
 */
export function useClientDashboard() {
  return useQuery(
    async (authHeaders) => {
      return apiClient.getClientDashboard(authHeaders)
    },
    {
      enabled: true,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  )
}

/**
 * Generic mutation hook for POST/PUT/DELETE operations
 */
export function useMutation<T = any>(
  mutationFn: (variables: any, options: any) => Promise<ApiResponse<T>>
): UseMutationReturn<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const mutate = useCallback(
    async (variables: any) => {
      try {
        setLoading(true)
        setError(null)

        const authHeaders = getAuthHeaders()
        const response = await mutationFn(variables, authHeaders)

        if (!response.success) {
          throw new Error(response.error || 'Operation failed')
        }

        setData(response.data || null)
        return response.data || null
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [mutationFn]
  )

  return { mutate, loading, error, data }
}

/**
 * Hook for creating clients
 */
export function useCreateClient() {
  return useMutation(async (variables, authHeaders) => {
    return apiClient.createClient(variables, authHeaders)
  })
}

/**
 * Hook for updating clients
 */
export function useUpdateClient(clientId: string) {
  return useMutation(async (variables, authHeaders) => {
    return apiClient.updateClient(clientId, variables, authHeaders)
  })
}

/**
 * Hook for deleting clients
 */
export function useDeleteClient() {
  return useMutation(async (variables, authHeaders) => {
    return apiClient.deleteClient(variables.id, authHeaders)
  })
}

/**
 * Hook for creating invoices
 */
export function useCreateInvoice() {
  return useMutation(async (variables, authHeaders) => {
    return apiClient.createInvoice(variables, authHeaders)
  })
}

/**
 * Hook for approving invoices
 */
export function useApproveInvoice() {
  return useMutation(async (variables, authHeaders) => {
    return apiClient.approveInvoice(variables.id, variables.notes, authHeaders)
  })
}

/**
 * Hook for rejecting invoices
 */
export function useRejectInvoice() {
  return useMutation(async (variables, authHeaders) => {
    return apiClient.rejectInvoice(variables.id, variables.notes, authHeaders)
  })
}

/**
 * Hook for login
 */
export function useLogin() {
  return useMutation(async (variables, authHeaders) => {
    const response = await apiClient.login(variables.email, variables.password)

    if (response.success && response.data) {
      // Store token and userId in localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userId', response.data.user.id)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response
  })
}

/**
 * Hook for register
 */
export function useRegister() {
  return useMutation(async (variables, authHeaders) => {
    return apiClient.register(
      variables.email,
      variables.password,
      variables.full_name,
      variables.phone
    )
  })
}

/**
 * Hook for logout
 */
export function useLogout() {
  return useMutation(async (variables, authHeaders) => {
    const response = await apiClient.logout(authHeaders)

    if (response.success) {
      // Clear authentication from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('user')
    }

    return response
  })
}
