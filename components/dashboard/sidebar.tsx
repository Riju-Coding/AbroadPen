"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, MapPin, Building2, UserPlus, Users, DollarSign, BarChart3, UserCog, ShieldCheck, Languages } from "lucide-react"

interface SidebarProps {
  userData: {
    role: "super_admin" | "consultant"
    name: string
  }
}

export function Sidebar({ userData }: SidebarProps) {
  const pathname = usePathname()

  const superAdminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/locations", label: "Locations", icon: MapPin },
    { href: "/admin/consultants", label: "Consultants", icon: UserCog },
    { href: "/admin/recognitions", label: "Recognitions", icon: ShieldCheck },
    { href: "/admin/mediums", label: "Medium of Teaching", icon: Languages },
    { href: "/admin/universities", label: "Universities (MBBS)", icon: Building2 },
    { href: "/admin/faculties", label: "Faculties", icon: Users },
    { href: "/admin/leads", label: "Leads", icon: UserPlus },
    { href: "/admin/commissions", label: "Commissions", icon: DollarSign },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ]

  const consultantLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/universities", label: "My Universities", icon: Building2 },
    { href: "/admin/leads", label: "Leads", icon: UserPlus },
    { href: "/admin/commissions", label: "My Commissions", icon: DollarSign },
  ]

  const links = userData.role === "super_admin" ? superAdminLinks : consultantLinks

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold">AbroadPen</h1>
      </div>
      <nav className="space-y-1 p-4">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
