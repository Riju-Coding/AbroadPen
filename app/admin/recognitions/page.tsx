"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RecognitionsPage() {
  const { toast } = useToast()
  const [recognitions, setRecognitions] = useState<{ id: string; name: string; logoUrl?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; logoUrl?: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
  })

  useEffect(() => {
    loadRecognitions()
  }, [])

  const loadRecognitions = async () => {
    try {
      const q = query(collection(db, "recognitions"), orderBy("name"))
      const snapshot = await getDocs(q)
      setRecognitions(
        snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name, logoUrl: doc.data().logoUrl || "" })),
      )
    } catch (error) {
      toast({ title: "Error", description: "Failed to load recognitions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await updateDoc(doc(db, "recognitions", editingItem.id), { name: formData.name, logoUrl: formData.logoUrl })
        toast({ title: "Success", description: "Recognition updated" })
      } else {
        await addDoc(collection(db, "recognitions"), { name: formData.name, logoUrl: formData.logoUrl })
        toast({ title: "Success", description: "Recognition added" })
      }
      setDialogOpen(false)
      setFormData({ name: "", logoUrl: "" })
      setEditingItem(null)
      loadRecognitions()
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recognitions</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null)
                setFormData({ name: "", logoUrl: "" })
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Recognition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Recognition</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                />
                {formData.logoUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.logoUrl || "/placeholder.svg"}
                      alt="Logo preview"
                      className="h-16 w-16 rounded border object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recognitions.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl || "/placeholder.svg"}
                      alt={item.name}
                      className="h-10 w-10 rounded border object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      No logo
                    </div>
                  )}
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingItem(item)
                      setFormData({ name: item.name, logoUrl: item.logoUrl || "" })
                      setDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("Delete?")) {
                        await deleteDoc(doc(db, "recognitions", item.id))
                        loadRecognitions()
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
