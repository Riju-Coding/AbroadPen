"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
import type { State, Country } from "@/lib/types"

export function StatesTab() {
  const [states, setStates] = useState<State[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingState, setEditingState] = useState<State | null>(null)
  const [formData, setFormData] = useState({ name: "", code: "", countryId: "" })
  const [filterCountry, setFilterCountry] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [countriesSnapshot, statesSnapshot] = await Promise.all([
        getDocs(collection(db, "countries")),
        getDocs(collection(db, "states")),
      ])

      const countriesData = countriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Country[]

      const statesData = statesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as State[]

      setCountries(countriesData)
      setStates(statesData)
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
      if (editingState) {
        await updateDoc(doc(db, "states", editingState.id), {
          ...formData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "State updated successfully" })
      } else {
        await addDoc(collection(db, "states"), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "State added successfully" })
      }

      setIsDialogOpen(false)
      setFormData({ name: "", code: "", countryId: "" })
      setEditingState(null)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save state",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (state: State) => {
    setEditingState(state)
    setFormData({ name: state.name, code: state.code, countryId: state.countryId })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this state?")) return

    try {
      await deleteDoc(doc(db, "states", id))
      toast({ title: "Success", description: "State deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete state",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setFormData({ name: "", code: "", countryId: "" })
    setEditingState(null)
  }

  const getCountryName = (countryId: string) => {
    return countries.find((c) => c.id === countryId)?.name || "Unknown"
  }

  const filteredStates = filterCountry === "all" ? states : states.filter((s) => s.countryId === filterCountry)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>States / Provinces</CardTitle>
          <CardDescription>Manage all states and provinces</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="mr-2 h-4 w-4" />
                Add State
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingState ? "Edit State" : "Add New State"}</DialogTitle>
                <DialogDescription>
                  {editingState ? "Update state information" : "Enter the details for the new state"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.countryId}
                      onValueChange={(value) => setFormData({ ...formData, countryId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">State Name</Label>
                    <Input
                      id="name"
                      placeholder="California"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">State Code</Label>
                    <Input
                      id="code"
                      placeholder="CA"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingState ? "Update" : "Add"} State</Button>
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
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No states found. Add your first state to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredStates.map((state) => (
                <TableRow key={state.id}>
                  <TableCell className="font-medium">{state.name}</TableCell>
                  <TableCell>{state.code}</TableCell>
                  <TableCell>{getCountryName(state.countryId)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(state)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(state.id)}>
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
  )
}
