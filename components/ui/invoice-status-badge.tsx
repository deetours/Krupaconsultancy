interface InvoiceStatusBadgeProps {
  status: "pending" | "review" | "approved" | "rejected"
}

const statusConfig = {
  pending: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: "Pending",
  },
  review: {
    bg: "bg-gray-200",
    text: "text-gray-700",
    label: "Review",
  },
  approved: {
    bg: "bg-black",
    text: "text-white",
    label: "Approved",
  },
  rejected: {
    bg: "bg-white border border-black",
    text: "text-black",
    label: "Rejected",
  },
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
