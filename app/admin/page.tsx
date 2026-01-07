"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, UserPlus, GraduationCap, DollarSign, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { userData } = useAuth()
  const [stats, setStats] = useState({
    leads: 0,
    applications: 0,
    students: 0,
    universities: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
  })

  useEffect(() => {
    loadStats()
  }, [userData])

  const loadStats = async () => {
    try {
      const [leadsSnapshot, applicationsSnapshot, studentsSnapshot, universitiesSnapshot, commissionsSnapshot] =
        await Promise.all([
          getDocs(collection(db, "leads")),
          getDocs(collection(db, "applications")),
          getDocs(collection(db, "students")),
          getDocs(collection(db, "universities")),
          getDocs(collection(db, "commissions")),
        ])

      const commissions = commissionsSnapshot.docs.map((doc) => doc.data())
      const filteredCommissions =
        userData?.role === "consultant" ? commissions.filter((c: any) => c.consultantId === userData.uid) : commissions

      setStats({
        leads: leadsSnapshot.size,
        applications: applicationsSnapshot.size,
        students: studentsSnapshot.size,
        universities: universitiesSnapshot.size,
        totalCommissions: filteredCommissions.reduce((sum: number, c: any) => sum + (c.commissionAmount || 0), 0),
        pendingCommissions: filteredCommissions
          .filter((c: any) => c.status === "pending")
          .reduce((sum: number, c: any) => sum + (c.commissionAmount || 0), 0),
      })
    } catch (error) {
      console.error("Failed to load stats", error)
    }
  }

  const dashboardStats = [
    {
      title: "Total Leads",
      value: stats.leads.toString(),
      icon: UserPlus,
      description: "Active leads in pipeline",
    },
    {
      title: "Applications",
      value: stats.applications.toString(),
      icon: GraduationCap,
      description: "In progress applications",
    },
    {
      title: "Students",
      value: stats.students.toString(),
      icon: Users,
      description: "Enrolled students",
    },
    {
      title: "Universities",
      value: stats.universities.toString(),
      icon: Building2,
      description: userData?.role === "super_admin" ? "Total universities" : "Assigned universities",
    },
    {
      title: "Total Commissions",
      value: `$${stats.totalCommissions.toLocaleString()}`,
      icon: DollarSign,
      description: "All time earnings",
    },
    {
      title: "Pending Commissions",
      value: `$${stats.pendingCommissions.toLocaleString()}`,
      icon: TrendingUp,
      description: "Awaiting payment",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {userData?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Dashboard overview showing key metrics. Navigate to specific sections for detailed management.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
