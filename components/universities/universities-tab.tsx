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
import { Checkbox } from "@/components/ui/checkbox"
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
import type { University, Country, State, City } from "@/lib/types"

interface UniversitiesTabProps {
  assignedUniversities: University[]
}

export function UniversitiesTab({ assignedUniversities }: UniversitiesTabProps) {
  const { userData } = useAuth()
  const [universities, setUniversities] = useState<University[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    countryId: "",
    stateId: "",
    cityId: "",
    address: "",
    website: "",
    assignedConsultants: [] as string[],
  })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [countriesSnapshot, statesSnapshot, citiesSnapshot, universitiesSnapshot, usersSnapshot] =
        await Promise.all([
          getDocs(collection(db, "countries")),
          getDocs(collection(db, "states")),
          getDocs(collection(db, "cities")),
          getDocs(collection(db, "universities")),
          getDocs(collection(db, "users")),
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

      const universitiesData = universitiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as University[]

      const consultantsData = usersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user: any) => user.role === "consultant")

      setCountries(countriesData)
      setStates(statesData)
      setCities(citiesData)
      setUniversities(universitiesData)
      setConsultants(consultantsData)
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
      if (editingUniversity) {
        await updateDoc(doc(db, "universities", editingUniversity.id), {
          ...formData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "University updated successfully" })
      } else {
        await addDoc(collection(db, "universities"), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "University added successfully" })
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save university",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (university: University) => {
    setEditingUniversity(university)
    setFormData({
      name: university.name,
      countryId: university.countryId,
      stateId: university.stateId,
      cityId: university.cityId,
      address: university.address,
      website: university.website || "",
      assignedConsultants: university.assignedConsultants || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this university?")) return

    try {
      await deleteDoc(doc(db, "universities", id))
      toast({ title: "Success", description: "University deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete university",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      countryId: "",
      stateId: "",
      cityId: "",
      address: "",
      website: "",
      assignedConsultants: [],
    })
    setEditingUniversity(null)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const getLocationName = (id: string, type: "country" | "state" | "city") => {
    if (type === "country") return countries.find((c) => c.id === id)?.name || "Unknown"
    if (type === "state") return states.find((s) => s.id === id)?.name || "Unknown"
    return cities.find((c) => c.id === id)?.name || "Unknown"
  }

  const filteredStates = formData.countryId ? states.filter((s) => s.countryId === formData.countryId) : []
  const filteredCities = formData.stateId ? cities.filter((c) => c.stateId === formData.stateId) : []

  const displayUniversities = userData?.role === "consultant" ? assignedUniversities : universities
  const canEdit = userData?.role === "super_admin"

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Universities</CardTitle>
          <CardDescription>
            {userData?.role === "super_admin" ? "Manage all universities" : "View your assigned universities"}
          </CardDescription>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="mr-2 h-4 w-4" />
                Add University
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingUniversity ? "Edit University" : "Add New University"}</DialogTitle>
                <DialogDescription>
                  {editingUniversity ? "Update university information" : "Enter the details for the new university"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="name">University Name</Label>
                    <Input
                      id="name"
                      placeholder="Harvard University"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={formData.countryId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, countryId: value, stateId: "", cityId: "" })
                        }
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
                        onValueChange={(value) => setFormData({ ...formData, stateId: value, cityId: "" })}
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
                      <Label htmlFor="city">City</Label>
                      <Select
                        value={formData.cityId}
                        onValueChange={(value) => setFormData({ ...formData, cityId: value })}
                        required
                        disabled={!formData.stateId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="123 University Street"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://university.edu"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Assign Consultants</Label>
                    <div className="border rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                      {consultants.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No consultants available</p>
                      ) : (
                        consultants.map((consultant) => (
                          <div key={consultant.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={consultant.id}
                              checked={formData.assignedConsultants.includes(consultant.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    assignedConsultants: [...formData.assignedConsultants, consultant.id],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    assignedConsultants: formData.assignedConsultants.filter(
                                      (id) => id !== consultant.id,
                                    ),
                                  })
                                }
                              }}
                            />
                            <label htmlFor={consultant.id} className="text-sm font-medium cursor-pointer">
                              {consultant.name} ({consultant.email})
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingUniversity ? "Update" : "Add"} University</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Website</TableHead>
              {userData?.role === "super_admin" && <TableHead>Assigned Consultants</TableHead>}
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayUniversities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={userData?.role === "super_admin" ? 5 : 3}
                  className="text-center text-muted-foreground"
                >
                  {userData?.role === "consultant"
                    ? "No universities assigned to you yet"
                    : "No universities found. Add your first university to get started."}
                </TableCell>
              </TableRow>
            ) : (
              displayUniversities.map((university) => (
                <TableRow key={university.id}>
                  <TableCell className="font-medium">{university.name}</TableCell>
                  <TableCell>
                    {getLocationName(university.cityId, "city")}, {getLocationName(university.stateId, "state")},{" "}
                    {getLocationName(university.countryId, "country")}
                  </TableCell>
                  <TableCell>
                    {university.website ? (
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  {userData?.role === "super_admin" && (
                    <TableCell>{university.assignedConsultants?.length || 0} consultants</TableCell>
                  )}
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(university)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(university.id)}>
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
