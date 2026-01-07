"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Faculty } from "@/lib/types"

export default function FacultiesPage() {
  const { userData } = useAuth()
  const { toast } = useToast()
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [formData, setFormData] = useState({
    name: "",
  })

  useEffect(() => {
    loadFaculties()
  }, [])

  const loadFaculties = async () => {
    try {
      const q = query(collection(db, "faculties"), orderBy("name"))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Faculty[]
      setFaculties(data)
    } catch (error) {
      console.error("Failed to load faculties", error)
      toast({
        title: "Error",
        description: "Failed to load faculties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingFaculty) {
        await updateDoc(doc(db, "faculties", editingFaculty.id), {
          name: formData.name,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Faculty updated successfully" })
      } else {
        await addDoc(collection(db, "faculties"), {
          name: formData.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Faculty added successfully" })
      }

      setDialogOpen(false)
      resetForm()
      loadFaculties()
    } catch (error) {
      console.error("Failed to save faculty", error)
      toast({
        title: "Error",
        description: "Failed to save faculty",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty)
    setFormData({
      name: faculty.name,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faculty?")) return

    try {
      await deleteDoc(doc(db, "faculties", id))
      toast({ title: "Success", description: "Faculty deleted successfully" })
      loadFaculties()
    } catch (error) {
      console.error("Failed to delete faculty", error)
      toast({
        title: "Error",
        description: "Failed to delete faculty",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
    })
    setEditingFaculty(null)
  }

  if (userData?.role !== "super_admin") {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Access denied. Super Admin only.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculties Management</h1>
          <p className="text-muted-foreground">Manage faculty names for universities</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFaculty ? "Edit Faculty" : "Add Faculty"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Faculty Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Dr. John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {editingFaculty ? "Update" : "Add"} Faculty
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : faculties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No faculties found. Add your first faculty.
                </TableCell>
              </TableRow>
            ) : (
              faculties.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell className="font-medium">{faculty.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(faculty)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(faculty.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
