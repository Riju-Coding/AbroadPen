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
import type { City, State, Country } from "@/lib/types"

export function CitiesTab() {
  const [cities, setCities] = useState<City[]>([])
  const [states, setStates] = useState<State[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [formData, setFormData] = useState({ name: "", countryId: "", stateId: "" })
  const [filterState, setFilterState] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [countriesSnapshot, statesSnapshot, citiesSnapshot] = await Promise.all([
        getDocs(collection(db, "countries")),
        getDocs(collection(db, "states")),
        getDocs(collection(db, "cities")),
      ])

      const countriesData = countriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Country[]

      const statesData = statesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as State[]

      const citiesData = citiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as City[]

      setCountries(countriesData)
      setStates(statesData)
      setCities(citiesData)
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
      if (editingCity) {
        await updateDoc(doc(db, "cities", editingCity.id), {
          ...formData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "City updated successfully" })
      } else {
        await addDoc(collection(db, "cities"), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "City added successfully" })
      }

      setIsDialogOpen(false)
      setFormData({ name: "", countryId: "", stateId: "" })
      setEditingCity(null)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save city",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (city: City) => {
    setEditingCity(city)
    setFormData({ name: city.name, countryId: city.countryId, stateId: city.stateId })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this city?")) return

    try {
      await deleteDoc(doc(db, "cities", id))
      toast({ title: "Success", description: "City deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete city",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setFormData({ name: "", countryId: "", stateId: "" })
    setEditingCity(null)
  }

  const getStateName = (stateId: string) => {
    return states.find((s) => s.id === stateId)?.name || "Unknown"
  }

  const getCountryName = (countryId: string) => {
    return countries.find((c) => c.id === countryId)?.name || "Unknown"
  }

  const filteredStates = formData.countryId ? states.filter((s) => s.countryId === formData.countryId) : []
  const filteredCities = filterState === "all" ? cities : cities.filter((c) => c.stateId === filterState)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Cities</CardTitle>
          <CardDescription>Manage all cities in the system</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="mr-2 h-4 w-4" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCity ? "Edit City" : "Add New City"}</DialogTitle>
                <DialogDescription>
                  {editingCity ? "Update city information" : "Enter the details for the new city"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.countryId}
                      onValueChange={(value) => setFormData({ ...formData, countryId: value, stateId: "" })}
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
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={formData.stateId}
                      onValueChange={(value) => setFormData({ ...formData, stateId: value })}
                      required
                      disabled={!formData.countryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStates.map((state) => (
                          <SelectItem key={state.id} value={state.id}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">City Name</Label>
                    <Input
                      id="name"
                      placeholder="Los Angeles"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingCity ? "Update" : "Add"} City</Button>
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
              <TableHead>State</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No cities found. Add your first city to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredCities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell className="font-medium">{city.name}</TableCell>
                  <TableCell>{getStateName(city.stateId)}</TableCell>
                  <TableCell>{getCountryName(city.countryId)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(city)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(city.id)}>
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
