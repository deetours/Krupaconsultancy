interface ClientStatusBadgeProps {
  status: "active" | "suspended"
}

const statusConfig = {
  active: {
    bg: "bg-black",
    text: "text-white",
    icon: "●",
  },
  suspended: {
    bg: "bg-white border border-black",
    text: "text-black",
    icon: "○",
  },
}

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span>{config.icon}</span>
      {status === "active" ? "Active" : "Suspended"}
    </span>
  )
}
