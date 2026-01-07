"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FeeStructure {
  id: string
  collegeId: string
  collegeName?: string
  courseId: string
  courseName?: string
  year: number
  tuition: number
  otherFees: number
  currency: string
  notes: string
  partnerSharePercent: number
  fixedCommission: number
  createdAt: Date
}

interface College {
  id: string
  name: string
  universityId: string
}

interface Course {
  id: string
  name: string
  collegeId: string
}

export default function FeeStructuresPage() {
  const [fees, setFees] = useState<FeeStructure[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    collegeId: "",
    courseId: "",
    year: 1,
    tuition: 0,
    otherFees: 0,
    currency: "INR",
    notes: "",
    partnerSharePercent: 0,
    fixedCommission: 0,
  })

  useEffect(() => {
    fetchFees()
    fetchColleges()
    fetchCourses()
  }, [])

  useEffect(() => {
    if (formData.collegeId) {
      setFilteredCourses(courses.filter((c) => c.collegeId === formData.collegeId))
    } else {
      setFilteredCourses([])
    }
  }, [formData.collegeId, courses])

  const fetchFees = async () => {
    try {
      const snapshot = await getDocs(collection(db, "fees"))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as FeeStructure[]
      setFees(data)
    } catch (error) {
      console.error("Error fetching fees:", error)
      toast({
        title: "Error",
        description: "Failed to fetch fee structures",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchColleges = async () => {
    try {
      const snapshot = await getDocs(collection(db, "colleges"))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as College[]
      setColleges(data)
    } catch (error) {
      console.error("Error fetching colleges:", error)
    }
  }

  const fetchCourses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "courses"))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[]
      setCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const feeData = {
        ...formData,
        createdAt: editingFee ? editingFee.createdAt : new Date(),
        updatedAt: new Date(),
      }

      if (editingFee) {
        await updateDoc(doc(db, "fees", editingFee.id), feeData)
        toast({
          title: "Success",
          description: "Fee structure updated successfully",
        })
      } else {
        await addDoc(collection(db, "fees"), feeData)
        toast({
          title: "Success",
          description: "Fee structure created successfully",
        })
      }

      setOpen(false)
      resetForm()
      fetchFees()
    } catch (error) {
      console.error("Error saving fee:", error)
      toast({
        title: "Error",
        description: "Failed to save fee structure",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return

    try {
      await deleteDoc(doc(db, "fees", id))
      toast({
        title: "Success",
        description: "Fee structure deleted successfully",
      })
      fetchFees()
    } catch (error) {
      console.error("Error deleting fee:", error)
      toast({
        title: "Error",
        description: "Failed to delete fee structure",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      collegeId: "",
      courseId: "",
      year: 1,
      tuition: 0,
      otherFees: 0,
      currency: "INR",
      notes: "",
      partnerSharePercent: 0,
      fixedCommission: 0,
    })
    setEditingFee(null)
  }

  const openEditDialog = (fee: FeeStructure) => {
    setEditingFee(fee)
    setFormData({
      collegeId: fee.collegeId,
      courseId: fee.courseId,
      year: fee.year,
      tuition: fee.tuition,
      otherFees: fee.otherFees,
      currency: fee.currency,
      notes: fee.notes,
      partnerSharePercent: fee.partnerSharePercent,
      fixedCommission: fee.fixedCommission,
    })
    setOpen(true)
  }

  const enrichedFees = fees.map((fee) => ({
    ...fee,
    collegeName: colleges.find((c) => c.id === fee.collegeId)?.name || "Unknown",
    courseName: courses.find((c) => c.id === fee.courseId)?.name || "Unknown",
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fee Structures</h1>
          <p className="text-muted-foreground">
            Manage course fees and commission structures by college, course, and year
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Fee Structure
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFee ? "Edit Fee Structure" : "Add New Fee Structure"}</DialogTitle>
              <DialogDescription>
                {editingFee ? "Update fee information" : "Create a new fee structure"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeId">College</Label>
                  <Select
                    value={formData.collegeId}
                    onValueChange={(value) => setFormData({ ...formData, collegeId: value, courseId: "" })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseId">Course</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                    required
                    disabled={!formData.collegeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tuition">Tuition</Label>
                  <Input
                    id="tuition"
                    type="number"
                    min="0"
                    value={formData.tuition}
                    onChange={(e) => setFormData({ ...formData, tuition: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherFees">Other Fees</Label>
                  <Input
                    id="otherFees"
                    type="number"
                    min="0"
                    value={formData.otherFees}
                    onChange={(e) => setFormData({ ...formData, otherFees: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerSharePercent">Partner Share %</Label>
                  <Input
                    id="partnerSharePercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.partnerSharePercent}
                    onChange={(e) =>
                      setFormData({ ...formData, partnerSharePercent: Number.parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixedCommission">Fixed Commission</Label>
                  <Input
                    id="fixedCommission"
                    type="number"
                    min="0"
                    value={formData.fixedCommission}
                    onChange={(e) => setFormData({ ...formData, fixedCommission: Number.parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional fee information"
                  rows={2}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : editingFee ? "Update Fee Structure" : "Create Fee Structure"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Fee Structures</CardTitle>
          <CardDescription>View and manage fee structures with commission details</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading fee structures...</p>
          ) : enrichedFees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No fee structures found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>College</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Tuition</TableHead>
                  <TableHead className="text-right">Other Fees</TableHead>
                  <TableHead className="text-right">Partner %</TableHead>
                  <TableHead className="text-right">Fixed Commission</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.collegeName}</TableCell>
                    <TableCell>{fee.courseName}</TableCell>
                    <TableCell>Year {fee.year}</TableCell>
                    <TableCell className="text-right">
                      {fee.currency} {fee.tuition.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {fee.currency} {fee.otherFees.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{fee.partnerSharePercent}%</TableCell>
                    <TableCell className="text-right">
                      {fee.currency} {fee.fixedCommission.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(fee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(fee.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
