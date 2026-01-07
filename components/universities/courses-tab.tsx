"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Course, College, University } from "@/lib/types"

interface CoursesTabProps {
  assignedUniversities: University[]
}

interface Stream {
  id: string
  name: string
  universityId: string
}

export function CoursesTab({ assignedUniversities }: CoursesTabProps) {
  const { userData } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    universityId: "",
    collegeId: "",
    streamId: "",
    level: "undergraduate" as "undergraduate" | "postgraduate" | "diploma" | "certificate",
    duration: "",
    tuitionFee: "",
    applicationFee: "",
    commissionPercentage: "",
  })
  const [filterCollege, setFilterCollege] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [universitiesSnapshot, collegesSnapshot, coursesSnapshot, streamsSnapshot] = await Promise.all([
        getDocs(collection(db, "universities")),
        getDocs(collection(db, "colleges")),
        getDocs(collection(db, "courses")),
        getDocs(collection(db, "streams")),
      ])

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

      const streamsData = streamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Stream[]

      setUniversities(universitiesData)
      setColleges(collegesData)
      setCourses(coursesData)
      setStreams(streamsData)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const courseData = {
        name: formData.name,
        universityId: formData.universityId,
        collegeId: formData.collegeId,
        streamId: formData.streamId,
        level: formData.level,
        duration: formData.duration,
        tuitionFee: Number.parseFloat(formData.tuitionFee),
        applicationFee: Number.parseFloat(formData.applicationFee),
        commissionPercentage: Number.parseFloat(formData.commissionPercentage),
      }

      if (editingCourse) {
        await updateDoc(doc(db, "courses", editingCourse.id), {
          ...courseData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Course updated successfully" })
      } else {
        await addDoc(collection(db, "courses"), {
          ...courseData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Course added successfully" })
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      universityId: course.universityId,
      collegeId: course.collegeId,
      streamId: (course as any).streamId || "",
      level: course.level,
      duration: course.duration,
      tuitionFee: course.tuitionFee.toString(),
      applicationFee: course.applicationFee.toString(),
      commissionPercentage: course.commissionPercentage.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      await deleteDoc(doc(db, "courses", id))
      toast({ title: "Success", description: "Course deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      universityId: "",
      collegeId: "",
      streamId: "",
      level: "undergraduate",
      duration: "",
      tuitionFee: "",
      applicationFee: "",
      commissionPercentage: "",
    })
    setEditingCourse(null)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const getStreamName = (streamId: string) => {
    return streams.find((s) => s.id === streamId)?.name || "N/A"
  }

  const getCollegeName = (collegeId: string) => {
    return colleges.find((c) => c.id === collegeId)?.name || "Unknown"
  }

  const getUniversityName = (universityId: string) => {
    return universities.find((u) => u.id === universityId)?.name || "Unknown"
  }

  const availableUniversities = userData?.role === "consultant" ? assignedUniversities : universities
  const availableColleges = colleges.filter((college) =>
    availableUniversities.some((uni) => uni.id === college.universityId),
  )

  const filteredColleges = formData.universityId ? colleges.filter((c) => c.universityId === formData.universityId) : []
  const filteredStreams = formData.universityId ? streams.filter((s) => s.universityId === formData.universityId) : []

  const filteredCourses = filterCollege === "all" ? courses : courses.filter((c) => c.collegeId === filterCollege)

  const displayCourses = filteredCourses.filter((course) =>
    availableUniversities.some((uni) => uni.id === course.universityId),
  )

  const canEdit = userData?.role === "super_admin"

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Courses / Programs</CardTitle>
          <CardDescription>Manage courses with fee structure and commission rates</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={filterCollege} onValueChange={setFilterCollege}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by college" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {availableColleges.map((college) => (
                <SelectItem key={college.id} value={college.id}>
                  {college.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
                  <DialogDescription>
                    {editingCourse ? "Update course information" : "Enter the details for the new course"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Select
                        value={formData.universityId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, universityId: value, collegeId: "", streamId: "" })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUniversities.map((university) => (
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
                        onValueChange={(value) => setFormData({ ...formData, collegeId: value })}
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
                      <Label htmlFor="stream">Stream</Label>
                      <Select
                        value={formData.streamId}
                        onValueChange={(value) => setFormData({ ...formData, streamId: value })}
                        required
                        disabled={!formData.universityId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stream" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredStreams.map((stream) => (
                            <SelectItem key={stream.id} value={stream.id}>
                              {stream.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Course Name</Label>
                      <Input
                        id="name"
                        placeholder="Bachelor of Computer Science"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="level">Level</Label>
                        <Select
                          value={formData.level}
                          onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="postgraduate">Postgraduate</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="certificate">Certificate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          placeholder="4 years"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tuitionFee">Tuition Fee ($)</Label>
                        <Input
                          id="tuitionFee"
                          type="number"
                          step="0.01"
                          placeholder="50000"
                          value={formData.tuitionFee}
                          onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="applicationFee">Application Fee ($)</Label>
                        <Input
                          id="applicationFee"
                          type="number"
                          step="0.01"
                          placeholder="100"
                          value={formData.applicationFee}
                          onChange={(e) => setFormData({ ...formData, applicationFee: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissionPercentage">Commission Percentage (%)</Label>
                      <Input
                        id="commissionPercentage"
                        type="number"
                        step="0.01"
                        placeholder="10"
                        value={formData.commissionPercentage}
                        onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingCourse ? "Update" : "Add"} Course</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Stream</TableHead>
              <TableHead>College</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Tuition Fee</TableHead>
              <TableHead>Commission %</TableHead>
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 9 : 8} className="text-center text-muted-foreground">
                  No courses found. Add your first course to get started.
                </TableCell>
              </TableRow>
            ) : (
              displayCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{getStreamName((course as any).streamId)}</TableCell>
                  <TableCell>{getCollegeName(course.collegeId)}</TableCell>
                  <TableCell>{getUniversityName(course.universityId)}</TableCell>
                  <TableCell className="capitalize">{course.level}</TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>${course.tuitionFee.toLocaleString()}</TableCell>
                  <TableCell>{course.commissionPercentage}%</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
