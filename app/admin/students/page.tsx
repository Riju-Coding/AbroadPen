"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, FileText, GraduationCap } from "lucide-react"
import type { Student, Application, University, College, Course } from "@/lib/types"

export default function StudentsPage() {
  const { userData } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [formData, setFormData] = useState({
    applicationId: "",
    enrollmentDate: "",
    expectedGraduation: "",
    documents: [] as string[],
  })
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [applicationsSnapshot, universitiesSnapshot, collegesSnapshot, coursesSnapshot, studentsSnapshot] =
        await Promise.all([
          getDocs(collection(db, "applications")),
          getDocs(collection(db, "universities")),
          getDocs(collection(db, "colleges")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "students")),
        ])

      const applicationsData = applicationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[]

      const universitiesData = universitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as University[]

      const collegesData = collegesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as College[]

      const coursesData = coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[]

      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[]

      setApplications(applicationsData)
      setUniversities(universitiesData)
      setColleges(collegesData)
      setCourses(coursesData)
      setStudents(studentsData)
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

  const handleFileUpload = async (): Promise<string[]> => {
    if (!selectedFiles || selectedFiles.length === 0) return formData.documents

    setUploadingFiles(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const timestamp = Date.now()
        const fileName = `students/${timestamp}_${file.name}`
        const storageRef = ref(storage, fileName)

        await uploadBytes(storageRef, file)
        const downloadUrl = await getDownloadURL(storageRef)
        uploadedUrls.push(downloadUrl)
      }

      return [...formData.documents, ...uploadedUrls]
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      })
      return formData.documents
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const documentUrls = await handleFileUpload()
      const application = applications.find((a) => a.id === formData.applicationId)

      if (!application) {
        toast({ title: "Error", description: "Application not found", variant: "destructive" })
        return
      }

      const studentData = {
        applicationId: formData.applicationId,
        leadId: application.leadId,
        name: application.studentName,
        email: application.studentEmail,
        phone: application.studentPhone,
        universityId: application.universityId,
        collegeId: application.collegeId,
        courseId: application.courseId,
        enrollmentDate: new Date(formData.enrollmentDate),
        expectedGraduation: new Date(formData.expectedGraduation),
        documents: documentUrls,
        assignedConsultant: application.assignedConsultant,
      }

      if (editingStudent) {
        await updateDoc(doc(db, "students", editingStudent.id), {
          ...studentData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Student updated successfully" })
      } else {
        await addDoc(collection(db, "students"), {
          ...studentData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        // Update application status to enrolled
        await updateDoc(doc(db, "applications", formData.applicationId), {
          status: "enrolled",
          updatedAt: new Date(),
        })

        toast({ title: "Success", description: "Student enrolled successfully" })
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save student",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      applicationId: student.applicationId,
      enrollmentDate: new Date(student.enrollmentDate).toISOString().split("T")[0],
      expectedGraduation: new Date(student.expectedGraduation).toISOString().split("T")[0],
      documents: student.documents || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student record?")) return

    try {
      await deleteDoc(doc(db, "students", id))
      toast({ title: "Success", description: "Student deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      applicationId: "",
      enrollmentDate: "",
      expectedGraduation: "",
      documents: [],
    })
    setEditingStudent(null)
    setSelectedFiles(null)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const getUniversityName = (universityId: string) => {
    return universities.find((u) => u.id === universityId)?.name || "Unknown"
  }

  const getCollegeName = (collegeId: string) => {
    return colleges.find((c) => c.id === collegeId)?.name || "Unknown"
  }

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.name || "Unknown"
  }

  const approvedApplications = applications.filter((app) => app.status === "approved")

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground">Manage enrolled students</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>All students currently enrolled in programs</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="mr-2 h-4 w-4" />
                Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingStudent ? "Edit Student" : "Enroll New Student"}</DialogTitle>
                <DialogDescription>
                  {editingStudent
                    ? "Update student enrollment details"
                    : "Select an approved application to enroll a student"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="application">Select Approved Application</Label>
                    <Select
                      value={formData.applicationId}
                      onValueChange={(value) => setFormData({ ...formData, applicationId: value })}
                      required
                      disabled={!!editingStudent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an approved application" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedApplications.map((application) => (
                          <SelectItem key={application.id} value={application.id}>
                            {application.studentName} - {getUniversityName(application.universityId)} -{" "}
                            {getCourseName(application.courseId)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                      <Input
                        id="enrollmentDate"
                        type="date"
                        value={formData.enrollmentDate}
                        onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expectedGraduation">Expected Graduation</Label>
                      <Input
                        id="expectedGraduation"
                        type="date"
                        value={formData.expectedGraduation}
                        onChange={(e) => setFormData({ ...formData, expectedGraduation: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents">Upload Documents (Optional)</Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    {formData.documents.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {formData.documents.length} document(s) already uploaded
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploadingFiles}>
                    {uploadingFiles ? "Uploading..." : editingStudent ? "Update Student" : "Enroll Student"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Expected Graduation</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No students enrolled yet. Enroll your first student from approved applications.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{getUniversityName(student.universityId)}</TableCell>
                    <TableCell>{getCourseName(student.courseId)}</TableCell>
                    <TableCell>{new Date(student.enrollmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(student.expectedGraduation).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {student.documents?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
