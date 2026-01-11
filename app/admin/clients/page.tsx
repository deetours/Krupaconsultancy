"use client"

import type React from "react"

import { useState } from "react"
import { GSTINInput } from "@/components/ui/gstin-input"
import { ClientStatusBadge } from "@/components/ui/client-status-badge"
import { demoClients } from "@/lib/demo-data"

export default function ClientAdmin() {
  const [clients, setClients] = useState(demoClients)
  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    turnover: "<1cr" as "<1cr" | "1-5cr" | ">5cr",
    frequency: "monthly" as "monthly" | "quarterly",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleInviteClient = () => {
    if (formData.name && formData.gstin && formData.turnover && formData.frequency) {
      setInviteSuccess(true)
      setTimeout(() => setInviteSuccess(false), 3000)
      setFormData({ name: "", gstin: "", turnover: "<1cr", frequency: "monthly" })
    }
  }

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()) || client.gstin.includes(searchQuery),
  )

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Onboarding Form */}
        <div className="max-w-2xl mx-auto mb-16 border border-gray-border rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-8">Onboard New Client</h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold">Client Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter client name"
                  className="w-full px-4 py-3 text-sm border border-gray-border rounded-lg focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <GSTINInput value={formData.gstin} onChange={(val) => setFormData((prev) => ({ ...prev, gstin: val }))} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold">Turnover Band</label>
                <select
                  name="turnover"
                  value={formData.turnover}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 text-sm border border-gray-border rounded-lg focus:border-black focus:outline-none transition-colors"
                >
                  <option value="<1cr">Less than 1 Cr</option>
                  <option value="1-5cr">1 - 5 Cr</option>
                  <option value=">5cr">Greater than 5 Cr</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold">Filing Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 text-sm border border-gray-border rounded-lg focus:border-black focus:outline-none transition-colors"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleInviteClient}
              className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Invite Client
            </button>

            {inviteSuccess && (
              <div className="p-4 bg-gray-50 border border-gray-border rounded-lg flex items-center gap-3">
                <svg className="w-5 h-5 text-black shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium">Invite link sent! Share it with your client.</p>
              </div>
            )}
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Manage Clients</h2>

          <div className="relative">
            <svg
              className="absolute left-4 top-3 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or GSTIN..."
              className="w-full pl-12 pr-4 py-3 text-sm border border-gray-border rounded-lg focus:border-black focus:outline-none transition-colors"
            />
          </div>

          <div className="border border-gray-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">GSTIN</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Last Filing</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-border hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{client.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{client.gstin}</td>
                    <td className="px-6 py-4">
                      <ClientStatusBadge status={client.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.last_filing || "N/A"}</td>
                    <td className="px-6 py-4 text-sm space-x-4">
                      <button className="text-gray-600 hover:text-black transition-colors">Edit</button>
                      <button className="text-gray-600 hover:text-black transition-colors">
                        {client.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
