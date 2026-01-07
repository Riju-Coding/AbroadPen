"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { College, University } from "@/lib/types"

interface CollegesTabProps {
  assignedUniversities: University[]
}

export function CollegesTab({ assignedUniversities }: CollegesTabProps) {
  const { userData } = useAuth()
  const [colleges, setColleges] = useState<College[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    universityId: "",
    description: "",
  })
  const [filterUniversity, setFilterUniversity] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [universitiesSnapshot, collegesSnapshot] = await Promise.all([
        getDocs(collection(db, "universities")),
        getDocs(collection(db, "colleges")),
      ])

      const universitiesData = universitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as University[]

      const collegesData = collegesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as College[]

      setUniversities(universitiesData)
      setColleges(collegesData)
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
      if (editingCollege) {
        await updateDoc(doc(db, "colleges", editingCollege.id), {
          ...formData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "College updated successfully" })
      } else {
        await addDoc(collection(db, "colleges"), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "College added successfully" })
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save college",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (college: College) => {
    setEditingCollege(college)
    setFormData({
      name: college.name,
      universityId: college.universityId,
      description: college.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this college?")) return

    try {
      await deleteDoc(doc(db, "colleges", id))
      toast({ title: "Success", description: "College deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete college",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      universityId: "",
      description: "",
    })
    setEditingCollege(null)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const getUniversityName = (universityId: string) => {
    return universities.find((u) => u.id === universityId)?.name || "Unknown"
  }

  const availableUniversities = userData?.role === "consultant" ? assignedUniversities : universities
  const filteredColleges =
    filterUniversity === "all" ? colleges : colleges.filter((c) => c.universityId === filterUniversity)

  const displayColleges = filteredColleges.filter((college) =>
    availableUniversities.some((uni) => uni.id === college.universityId),
  )

  const canEdit = userData?.role === "super_admin"

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Colleges / Schools</CardTitle>
          <CardDescription>Manage colleges within universities</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={filterUniversity} onValueChange={setFilterUniversity}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by university" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {availableUniversities.map((university) => (
                <SelectItem key={university.id} value={university.id}>
                  {university.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add College
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCollege ? "Edit College" : "Add New College"}</DialogTitle>
                  <DialogDescription>
                    {editingCollege ? "Update college information" : "Enter the details for the new college"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Select
                        value={formData.universityId}
                        onValueChange={(value) => setFormData({ ...formData, universityId: value })}
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
                      <Label htmlFor="name">College Name</Label>
                      <Input
                        id="name"
                        placeholder="School of Engineering"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the college"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingCollege ? "Update" : "Add"} College</Button>
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
              <TableHead>Name</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Description</TableHead>
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayColleges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 4 : 3} className="text-center text-muted-foreground">
                  No colleges found. Add your first college to get started.
                </TableCell>
              </TableRow>
            ) : (
              displayColleges.map((college) => (
                <TableRow key={college.id}>
                  <TableCell className="font-medium">{college.name}</TableCell>
                  <TableCell>{getUniversityName(college.universityId)}</TableCell>
                  <TableCell>{college.description || "-"}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(college)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(college.id)}>
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
