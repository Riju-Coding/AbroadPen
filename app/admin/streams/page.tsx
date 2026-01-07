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

interface Stream {
  id: string
  name: string
  description: string
  universityId: string
  universityName?: string
  isActive: boolean
  createdAt: Date
}

interface University {
  id: string
  name: string
}

export default function StreamsPage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingStream, setEditingStream] = useState<Stream | null>(null)
  const [filterUniversity, setFilterUniversity] = useState<string>("all")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    universityId: "",
    isActive: true,
  })

  useEffect(() => {
    fetchStreams()
    fetchUniversities()
  }, [])

  const fetchStreams = async () => {
    try {
      const snapshot = await getDocs(collection(db, "streams"))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Stream[]
      setStreams(data)
    } catch (error) {
      console.error("Error fetching streams:", error)
      toast({
        title: "Error",
        description: "Failed to fetch streams",
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
        name: doc.data().name,
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
      const streamData = {
        ...formData,
        createdAt: editingStream ? editingStream.createdAt : new Date(),
        updatedAt: new Date(),
      }

      if (editingStream) {
        await updateDoc(doc(db, "streams", editingStream.id), streamData)
        toast({
          title: "Success",
          description: "Stream updated successfully",
        })
      } else {
        await addDoc(collection(db, "streams"), streamData)
        toast({
          title: "Success",
          description: "Stream created successfully",
        })
      }

      setOpen(false)
      resetForm()
      fetchStreams()
    } catch (error) {
      console.error("Error saving stream:", error)
      toast({
        title: "Error",
        description: "Failed to save stream",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stream?")) return

    try {
      await deleteDoc(doc(db, "streams", id))
      toast({
        title: "Success",
        description: "Stream deleted successfully",
      })
      fetchStreams()
    } catch (error) {
      console.error("Error deleting stream:", error)
      toast({
        title: "Error",
        description: "Failed to delete stream",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      universityId: "",
      isActive: true,
    })
    setEditingStream(null)
  }

  const openEditDialog = (stream: Stream) => {
    setEditingStream(stream)
    setFormData({
      name: stream.name,
      description: stream.description,
      universityId: stream.universityId,
      isActive: stream.isActive,
    })
    setOpen(true)
  }

  const filteredStreams = streams
    .filter((stream) => filterUniversity === "all" || stream.universityId === filterUniversity)
    .map((stream) => ({
      ...stream,
      universityName: universities.find((u) => u.id === stream.universityId)?.name || "Unknown",
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academic Streams</h1>
          <p className="text-muted-foreground">Manage streams like Engineering, Medical, Arts, etc.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stream
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStream ? "Edit Stream" : "Add New Stream"}</DialogTitle>
              <DialogDescription>
                {editingStream ? "Update stream information" : "Create a new academic stream"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="universityId">University</Label>
                <Select
                  value={formData.universityId}
                  onValueChange={(value) => setFormData({ ...formData, universityId: value })}
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
                <Label htmlFor="name">Stream Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Engineering, Medical, Arts"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this academic stream"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : editingStream ? "Update Stream" : "Create Stream"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Streams</CardTitle>
              <CardDescription>View and manage academic streams</CardDescription>
            </div>
            <Select value={filterUniversity} onValueChange={setFilterUniversity}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by university" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={university.id}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading streams...</p>
          ) : filteredStreams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No streams found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stream Name</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStreams.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell className="font-medium">{stream.name}</TableCell>
                    <TableCell>{stream.universityName}</TableCell>
                    <TableCell className="max-w-xs truncate">{stream.description}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stream.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {stream.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(stream)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(stream.id)}>
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
