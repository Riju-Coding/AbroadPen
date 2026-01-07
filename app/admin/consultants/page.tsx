"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

interface Consultant {
  id: string
  uid: string
  email: string
  name: string
  phone: string
  assignedUniversityIds: string[]
  createdAt: Date
  registered: boolean
}

interface University {
  id: string
  name: string
  countryId: string
}

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null)
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [selectedUniversityIds, setSelectedUniversityIds] = useState<string[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    fetchConsultants()
    fetchUniversities()
  }, [])

  const fetchConsultants = async () => {
    try {
      const q = query(collection(db, "users"), where("role", "==", "consultant"))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Consultant[]
      setConsultants(data)
    } catch (error) {
      console.error("Error fetching consultants:", error)
      toast({
        title: "Error",
        description: "Failed to fetch consultants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUniversities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "universities"))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as University[]
      setUniversities(data)
    } catch (error) {
      console.error("Error fetching universities:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingConsultant) {
        // Update existing consultant
        const consultantRef = doc(db, "users", editingConsultant.id)
        await updateDoc(consultantRef, {
          name: formData.name,
          phone: formData.phone,
        })
        toast({
          title: "Success",
          description: "Consultant updated successfully",
        })
      } else {
        await addDoc(collection(db, "users"), {
          uid: "", // Empty until consultant registers
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          role: "consultant",
          assignedUniversityIds: [],
          registered: false, // Flag to track if consultant has completed registration
          createdAt: new Date(),
        })

        toast({
          title: "Success",
          description: "Consultant created successfully. They can now register using their email.",
        })
      }

      setOpen(false)
      resetForm()
      fetchConsultants()
    } catch (error: any) {
      console.error("Error saving consultant:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save consultant",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this consultant?")) return

    try {
      await deleteDoc(doc(db, "users", id))
      toast({
        title: "Success",
        description: "Consultant deleted successfully",
      })
      fetchConsultants()
    } catch (error) {
      console.error("Error deleting consultant:", error)
      toast({
        title: "Error",
        description: "Failed to delete consultant",
        variant: "destructive",
      })
    }
  }

  const openAssignDialog = (consultant: Consultant) => {
    setSelectedConsultant(consultant)
    setSelectedUniversityIds(consultant.assignedUniversityIds || [])
    setAssignOpen(true)
  }

  const handleAssignUniversities = async () => {
    if (!selectedConsultant) return

    try {
      const consultantRef = doc(db, "users", selectedConsultant.id)
      await updateDoc(consultantRef, {
        assignedUniversityIds: selectedUniversityIds,
      })
      toast({
        title: "Success",
        description: "Universities assigned successfully",
      })
      setAssignOpen(false)
      fetchConsultants()
    } catch (error) {
      console.error("Error assigning universities:", error)
      toast({
        title: "Error",
        description: "Failed to assign universities",
        variant: "destructive",
      })
    }
  }

  const toggleUniversity = (universityId: string) => {
    setSelectedUniversityIds((prev) =>
      prev.includes(universityId) ? prev.filter((id) => id !== universityId) : [...prev, universityId],
    )
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "" })
    setEditingConsultant(null)
  }

  const openEditDialog = (consultant: Consultant) => {
    setEditingConsultant(consultant)
    setFormData({
      name: consultant.name,
      email: consultant.email,
      phone: consultant.phone,
    })
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Consultants</h1>
          <p className="text-muted-foreground">Manage consultant accounts and university assignments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Consultant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingConsultant ? "Edit Consultant" : "Add New Consultant"}</DialogTitle>
              <DialogDescription>
                {editingConsultant ? "Update consultant information" : "Create a new consultant account"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingConsultant}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : editingConsultant ? "Update Consultant" : "Create Consultant"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Consultants</CardTitle>
          <CardDescription>View and manage consultant accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading consultants...</p>
          ) : consultants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No consultants found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Assigned Universities</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell className="font-medium">{consultant.name}</TableCell>
                    <TableCell>{consultant.email}</TableCell>
                    <TableCell>{consultant.phone}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {consultant.assignedUniversityIds?.length || 0} universities
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openAssignDialog(consultant)}>
                          <Building2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(consultant)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(consultant.id)}>
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

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Universities to {selectedConsultant?.name}</DialogTitle>
            <DialogDescription>Select which universities this consultant can manage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {universities.map((university) => (
              <div key={university.id} className="flex items-center space-x-2">
                <Checkbox
                  id={university.id}
                  checked={selectedUniversityIds.includes(university.id)}
                  onCheckedChange={() => toggleUniversity(university.id)}
                />
                <Label htmlFor={university.id} className="flex-1 cursor-pointer">
                  {university.name}
                </Label>
              </div>
            ))}
          </div>
          <Button onClick={handleAssignUniversities} className="w-full">
            Save Assignments
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
