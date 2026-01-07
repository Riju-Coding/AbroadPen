"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react"
import type { Commission, Student, Course } from "@/lib/types"

export default function CommissionsPage() {
  const { userData } = useAuth()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [generatingCommissions, setGeneratingCommissions] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [studentsSnapshot, coursesSnapshot, commissionsSnapshot] = await Promise.all([
        getDocs(collection(db, "students")),
        getDocs(collection(db, "courses")),
        getDocs(collection(db, "commissions")),
      ])

      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[]

      const coursesData = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[]

      const commissionsData = commissionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Commission[]

      setStudents(studentsData)
      setCourses(coursesData)
      setCommissions(commissionsData)
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

  const generateCommissions = async () => {
    setGeneratingCommissions(true)

    try {
      let generatedCount = 0

      for (const student of students) {
        // Check if commission already exists for this student
        const existingCommission = commissions.find((c) => c.studentId === student.id)
        if (existingCommission) continue

        const course = courses.find((c) => c.id === student.courseId)
        if (!course) continue

        const commissionAmount = (course.tuitionFee * course.commissionPercentage) / 100

        await addDoc(collection(db, "commissions"), {
          studentId: student.id,
          applicationId: student.applicationId,
          consultantId: student.assignedConsultant,
          courseId: student.courseId,
          tuitionFee: course.tuitionFee,
          commissionPercentage: course.commissionPercentage,
          commissionAmount,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        generatedCount++
      }

      setIsGenerateDialogOpen(false)
      loadData()

      toast({
        title: "Success",
        description: `Generated ${generatedCount} new commission records`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate commissions",
        variant: "destructive",
      })
    } finally {
      setGeneratingCommissions(false)
    }
  }

  const markAsPaid = async (commissionId: string) => {
    try {
      await updateDoc(doc(db, "commissions", commissionId), {
        status: "paid",
        paidDate: new Date(),
        updatedAt: new Date(),
      })

      toast({
        title: "Success",
        description: "Commission marked as paid",
      })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update commission",
        variant: "destructive",
      })
    }
  }

  const getStudentName = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.name || "Unknown"
  }

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.name || "Unknown"
  }

  const displayCommissions =
    userData?.role === "consultant" ? commissions.filter((c) => c.consultantId === userData.uid) : commissions

  const totalCommissions = displayCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const pendingCommissions = displayCommissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.commissionAmount, 0)
  const paidCommissions = displayCommissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.commissionAmount, 0)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {userData?.role === "super_admin" ? "Commission Management" : "My Commissions"}
        </h1>
        <p className="text-muted-foreground">Track and manage consultant commissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paidCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Commission Records</CardTitle>
            <CardDescription>All commission transactions</CardDescription>
          </div>
          {userData?.role === "super_admin" && (
            <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate Commissions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Commission Records</DialogTitle>
                  <DialogDescription>
                    This will create commission records for all enrolled students who don't already have one.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Commissions will be calculated based on the tuition fees and commission percentages defined for each
                    course.
                  </p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={generateCommissions} disabled={generatingCommissions}>
                    {generatingCommissions ? "Generating..." : "Generate Commissions"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Tuition Fee</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Commission Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
                {userData?.role === "super_admin" && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayCommissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={userData?.role === "super_admin" ? 8 : 7}
                    className="text-center text-muted-foreground"
                  >
                    {userData?.role === "consultant"
                      ? "No commissions found. Complete student enrollments to earn commissions."
                      : "No commissions found. Generate commission records from enrolled students."}
                  </TableCell>
                </TableRow>
              ) : (
                displayCommissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">{getStudentName(commission.studentId)}</TableCell>
                    <TableCell>{getCourseName(commission.courseId)}</TableCell>
                    <TableCell>${commission.tuitionFee.toLocaleString()}</TableCell>
                    <TableCell>{commission.commissionPercentage}%</TableCell>
                    <TableCell className="font-semibold">${commission.commissionAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={commission.status === "paid" ? "bg-green-500" : "bg-yellow-500"}>
                        {commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {commission.paidDate ? new Date(commission.paidDate).toLocaleDateString() : "-"}
                    </TableCell>
                    {userData?.role === "super_admin" && (
                      <TableCell className="text-right">
                        {commission.status === "pending" && (
                          <Button variant="outline" size="sm" onClick={() => markAsPaid(commission.id)}>
                            Mark as Paid
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
