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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, FileText } from "lucide-react"
import type { Application, Lead, University, College, Course } from "@/lib/types"

export default function ApplicationsPage() {
  const { userData } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [formData, setFormData] = useState({
    leadId: "",
    universityId: "",
    collegeId: "",
    courseId: "",
    status: "draft" as "draft" | "submitted" | "under_review" | "approved" | "rejected" | "enrolled",
    documents: [] as string[],
  })
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [leadsSnapshot, universitiesSnapshot, collegesSnapshot, coursesSnapshot, applicationsSnapshot] =
        await Promise.all([
          getDocs(collection(db, "leads")),
          getDocs(collection(db, "universities")),
          getDocs(collection(db, "colleges")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "applications")),
        ])

      const leadsData = leadsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[]

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

      const applicationsData = applicationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Application[]

      setLeads(leadsData)
      setUniversities(universitiesData)
      setColleges(collegesData)
      setCourses(coursesData)
      setApplications(applicationsData)
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
        const fileName = `applications/${timestamp}_${file.name}`
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
      const lead = leads.find((l) => l.id === formData.leadId)

      if (!lead) {
        toast({ title: "Error", description: "Lead not found", variant: "destructive" })
        return
      }

      const applicationData = {
        leadId: formData.leadId,
        studentName: lead.name,
        studentEmail: lead.email,
        studentPhone: lead.phone,
        universityId: formData.universityId,
        collegeId: formData.collegeId,
        courseId: formData.courseId,
        status: formData.status,
        documents: documentUrls,
        applicationDate: new Date(),
        assignedConsultant: userData?.role === "consultant" ? userData.uid : lead.assignedConsultant,
      }

      if (editingApplication) {
        await updateDoc(doc(db, "applications", editingApplication.id), {
          ...applicationData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Application updated successfully" })
      } else {
        await addDoc(collection(db, "applications"), {
          ...applicationData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Application created successfully" })
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save application",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (application: Application) => {
    setEditingApplication(application)
    setFormData({
      leadId: application.leadId,
      universityId: application.universityId,
      collegeId: application.collegeId,
      courseId: application.courseId,
      status: application.status,
      documents: application.documents || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    try {
      await deleteDoc(doc(db, "applications", id))
      toast({ title: "Success", description: "Application deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      leadId: "",
      universityId: "",
      collegeId: "",
      courseId: "",
      status: "draft",
      documents: [],
    })
    setEditingApplication(null)
    setSelectedFiles(null)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const getLeadName = (leadId: string) => {
    return leads.find((l) => l.id === leadId)?.name || "Unknown"
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

  const filteredColleges = formData.universityId ? colleges.filter((c) => c.universityId === formData.universityId) : []
  const filteredCourses = formData.collegeId ? courses.filter((c) => c.collegeId === formData.collegeId) : []

  const displayApplications =
    filterStatus === "all" ? applications : applications.filter((app) => app.status === filterStatus)

  const statusColors = {
    draft: "bg-gray-500",
    submitted: "bg-blue-500",
    under_review: "bg-yellow-500",
    approved: "bg-green-500",
    rejected: "bg-red-500",
    enrolled: "bg-purple-500",
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Management</h1>
        <p className="text-muted-foreground">Track and manage student applications</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Applications</CardTitle>
            <CardDescription>All applications in the system</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingApplication ? "Edit Application" : "Create New Application"}</DialogTitle>
                  <DialogDescription>
                    {editingApplication ? "Update application details" : "Fill in the application details"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                      <Label htmlFor="lead">Select Lead</Label>
                      <Select
                        value={formData.leadId}
                        onValueChange={(value) => setFormData({ ...formData, leadId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lead" />
                        </SelectTrigger>
                        <SelectContent>
                          {leads
                            .filter((lead) => lead.status === "qualified" || lead.status === "converted")
                            .map((lead) => (
                              <SelectItem key={lead.id} value={lead.id}>
                                {lead.name} ({lead.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Select
                        value={formData.universityId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, universityId: value, collegeId: "", courseId: "" })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((university) => (
                            <SelectItem key={university.id} value={university.id}>
                              {university.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="college">College</Label>
                      <Select
                        value={formData.collegeId}
                        onValueChange={(value) => setFormData({ ...formData, collegeId: value, courseId: "" })}
                        required
                        disabled={!formData.universityId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select college" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredColleges.map((college) => (
                            <SelectItem key={college.id} value={college.id}>
                              {college.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course">Course</Label>
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
                              {course.name} - ${course.tuitionFee.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="enrolled">Enrolled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documents">Upload Documents</Label>
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
                      {uploadingFiles
                        ? "Uploading..."
                        : editingApplication
                          ? "Update Application"
                          : "Create Application"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No applications found. Create your first application to get started.
                  </TableCell>
                </TableRow>
              ) : (
                displayApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.studentName}</TableCell>
                    <TableCell>{getUniversityName(application.universityId)}</TableCell>
                    <TableCell>{getCourseName(application.courseId)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[application.status]}>{application.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {application.documents?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(application.applicationDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(application)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(application.id)}>
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
