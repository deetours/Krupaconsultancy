"use client"

import { useState } from "react"
import { Home, FileText, Users, BarChart3, Settings } from "lucide-react"
import { MenuBar } from "@/components/ui/glow-menu"

const menuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/admin",
    gradient:
      "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: FileText,
    label: "Invoices",
    href: "/admin/invoices",
    gradient:
      "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  {
    icon: Users,
    label: "Clients",
    href: "/admin/clients",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
  {
    icon: BarChart3,
    label: "Reports",
    href: "/admin/reports",
    gradient:
      "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(124,58,255,0.06) 50%, rgba(109,40,217,0) 100%)",
    iconColor: "text-purple-500",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
    gradient:
      "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "text-red-500",
  },
]

export function GlowMenuDemo() {
  const [activeItem, setActiveItem] = useState<string>("Dashboard")

  const handleItemClick = (label: string) => {
    setActiveItem(label)
    // Navigate to the href if needed
    const item = menuItems.find((i) => i.label === label)
    if (item?.href) {
      // window.location.href = item.href
    }
  }

  return (
    <MenuBar
      items={menuItems}
      activeItem={activeItem}
      onItemClick={handleItemClick}
      className="w-full"
    />
  )
}
