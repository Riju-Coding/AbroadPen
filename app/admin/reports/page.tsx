"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, TrendingUp, Users, Building2, DollarSign } from "lucide-react"
import type { Lead, Application, Student, Commission, University, Course } from "@/lib/types"

export default function ReportsPage() {
  const { userData } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [
        leadsSnapshot,
        applicationsSnapshot,
        studentsSnapshot,
        commissionsSnapshot,
        universitiesSnapshot,
        coursesSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "leads")),
        getDocs(collection(db, "applications")),
        getDocs(collection(db, "students")),
        getDocs(collection(db, "commissions")),
        getDocs(collection(db, "universities")),
        getDocs(collection(db, "courses")),
      ])

      const leadsData = leadsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[]

      const applicationsData = applicationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[]

      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[]

      const commissionsData = commissionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Commission[]

      const universitiesData = universitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as University[]

      const coursesData = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[]

      setLeads(leadsData)
      setApplications(applicationsData)
      setStudents(studentsData)
      setCommissions(commissionsData)
      setUniversities(universitiesData)
      setCourses(coursesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const conversionRate = leads.length > 0 ? ((students.length / leads.length) * 100).toFixed(1) : "0"
  const avgCommissionPerStudent =
    students.length > 0
      ? (commissions.reduce((sum, c) => sum + c.commissionAmount, 0) / students.length).toFixed(2)
      : "0"

  const leadsByStatus = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    converted: leads.filter((l) => l.status === "converted").length,
    lost: leads.filter((l) => l.status === "lost").length,
  }

  const applicationsByStatus = {
    draft: applications.filter((a) => a.status === "draft").length,
    submitted: applications.filter((a) => a.status === "submitted").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    enrolled: applications.filter((a) => a.status === "enrolled").length,
  }

  const topUniversities = universities
    .map((uni) => ({
      name: uni.name,
      studentCount: students.filter((s) => s.universityId === uni.id).length,
    }))
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 5)

  const topCourses = courses
    .map((course) => ({
      name: course.name,
      studentCount: students.filter((s) => s.courseId === course.id).length,
      revenue: students.filter((s) => s.courseId === course.id).reduce((sum) => sum + course.tuitionFee, 0),
    }))
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 5)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and metrics</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">
              {leadsByStatus.new} new, {leadsByStatus.qualified} qualified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {applicationsByStatus.approved} approved, {applicationsByStatus.enrolled} enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">{conversionRate}% conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${commissions.reduce((sum, c) => sum + c.commissionAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">${avgCommissionPerStudent} avg per student</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Pipeline</CardTitle>
            <CardDescription>Breakdown of leads by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New</span>
              <span className="text-sm text-muted-foreground">{leadsByStatus.new}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Contacted</span>
              <span className="text-sm text-muted-foreground">{leadsByStatus.contacted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Qualified</span>
              <span className="text-sm text-muted-foreground">{leadsByStatus.qualified}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Converted</span>
              <span className="text-sm text-muted-foreground">{leadsByStatus.converted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Lost</span>
              <span className="text-sm text-muted-foreground">{leadsByStatus.lost}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Current application stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Draft</span>
              <span className="text-sm text-muted-foreground">{applicationsByStatus.draft}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Submitted</span>
              <span className="text-sm text-muted-foreground">{applicationsByStatus.submitted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Under Review</span>
              <span className="text-sm text-muted-foreground">{applicationsByStatus.under_review}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Approved</span>
              <span className="text-sm text-muted-foreground">{applicationsByStatus.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rejected</span>
              <span className="text-sm text-muted-foreground">{applicationsByStatus.rejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enrolled</span>
              <span className="text-sm text-muted-foreground">{applicationsByStatus.enrolled}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Universities</CardTitle>
            <CardDescription>By enrolled students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topUniversities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available</p>
            ) : (
              topUniversities.map((uni, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{uni.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{uni.studentCount} students</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Courses</CardTitle>
            <CardDescription>By enrollment and revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available</p>
            ) : (
              topCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{course.name}</span>
                    <p className="text-xs text-muted-foreground">{course.studentCount} students</p>
                  </div>
                  <span className="text-sm text-muted-foreground">${course.revenue.toLocaleString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
