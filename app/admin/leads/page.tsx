"use client"

import type React from "react"
import { useToast } from "@/components/ui/use-toast" // Import useToast hook

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
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Upload, Download } from "lucide-react"
import type { Lead, Country, State, City } from "@/lib/types"

export default function LeadsPage() {
  const { userData } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryId: "",
    stateId: "",
    cityId: "",
    interestedCountries: [] as string[],
    interestedCourses: "",
    notes: "",
    status: "new" as "new" | "contacted" | "qualified" | "converted" | "lost",
  })
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const { toast } = useToast() // Declare useToast hook

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [countriesSnapshot, statesSnapshot, citiesSnapshot, leadsSnapshot] = await Promise.all([
        getDocs(collection(db, "countries")),
        getDocs(collection(db, "states")),
        getDocs(collection(db, "cities")),
        getDocs(collection(db, "leads")),
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

      const leadsData = leadsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[]

      setCountries(countriesData)
      setStates(statesData)
      setCities(citiesData)
      setLeads(leadsData)
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
      const leadData = {
        ...formData,
        interestedCourses: formData.interestedCourses.split(",").map((c) => c.trim()),
        assignedConsultant: userData?.role === "consultant" ? userData.uid : undefined,
      }

      if (editingLead) {
        await updateDoc(doc(db, "leads", editingLead.id), {
          ...leadData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Lead updated successfully" })
      } else {
        await addDoc(collection(db, "leads"), {
          ...leadData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Lead added successfully" })
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lead",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      countryId: lead.countryId,
      stateId: lead.stateId || "",
      cityId: lead.cityId || "",
      interestedCountries: lead.interestedCountries,
      interestedCourses: lead.interestedCourses.join(", "),
      notes: lead.notes || "",
      status: lead.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return

    try {
      await deleteDoc(doc(db, "leads", id))
      toast({ title: "Success", description: "Lead deleted successfully" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      countryId: "",
      stateId: "",
      cityId: "",
      interestedCountries: [],
      interestedCourses: "",
      notes: "",
      status: "new",
    })
    setEditingLead(null)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast({ title: "Error", description: "Please select a CSV file", variant: "destructive" })
      return
    }

    try {
      setUploadProgress("Reading file...")
      const text = await csvFile.text()
      const rows = text.split("\n").filter((row) => row.trim())

      // Skip header row
      const dataRows = rows.slice(1)

      setUploadProgress(`Processing ${dataRows.length} leads...`)

      let successCount = 0
      let errorCount = 0

      for (const row of dataRows) {
        try {
          const columns = row.split(",").map((col) => col.trim().replace(/^"|"$/g, ""))

          if (columns.length < 4) continue

          const [name, email, phone, countryName, interestedCountriesStr, interestedCoursesStr, notes] = columns

          // Find country ID
          const country = countries.find((c) => c.name.toLowerCase() === countryName.toLowerCase())
          if (!country) {
            errorCount++
            continue
          }

          const interestedCountriesArray = interestedCountriesStr
            ? interestedCountriesStr.split(";").map((c) => c.trim())
            : []
          const interestedCoursesArray = interestedCoursesStr
            ? interestedCoursesStr.split(";").map((c) => c.trim())
            : []

          await addDoc(collection(db, "leads"), {
            name,
            email,
            phone,
            countryId: country.id,
            interestedCountries: interestedCountriesArray,
            interestedCourses: interestedCoursesArray,
            notes: notes || "",
            status: "new",
            assignedConsultant: userData?.role === "consultant" ? userData.uid : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          })

          successCount++
        } catch (error) {
          errorCount++
        }
      }

      setUploadProgress("")
      setIsUploadDialogOpen(false)
      setCsvFile(null)
      loadData()

      toast({
        title: "Upload Complete",
        description: `Successfully imported ${successCount} leads. ${errorCount} failed.`,
      })
    } catch (error) {
      setUploadProgress("")
      toast({
        title: "Error",
        description: "Failed to process CSV file",
        variant: "destructive",
      })
    }
  }

  const downloadCSVTemplate = () => {
    const template = `Name,Email,Phone,Country,Interested Countries (separated by ;),Interested Courses (separated by ;),Notes
John Doe,john@example.com,+1234567890,United States,United Kingdom;Canada,Computer Science;MBA,Looking for Masters programs
Jane Smith,jane@example.com,+0987654321,India,United States;Australia,Engineering;Data Science,Interested in scholarships`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "leads-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getCountryName = (countryId: string) => {
    return countries.find((c) => c.id === countryId)?.name || "Unknown"
  }

  const getStateName = (stateId: string) => {
    return states.find((s) => s.id === stateId)?.name || ""
  }

  const getCityName = (cityId: string) => {
    return cities.find((c) => c.id === cityId)?.name || ""
  }

  const filteredStates = formData.countryId ? states.filter((s) => s.countryId === formData.countryId) : []
  const filteredCities = formData.stateId ? cities.filter((c) => c.stateId === formData.stateId) : []

  const displayLeads = filterStatus === "all" ? leads : leads.filter((lead) => lead.status === filterStatus)

  const statusColors = {
    new: "bg-blue-500",
    contacted: "bg-yellow-500",
    qualified: "bg-green-500",
    converted: "bg-purple-500",
    lost: "bg-red-500",
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-muted-foreground">Manage and track all potential students</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Leads</CardTitle>
            <CardDescription>All leads in the system</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Leads from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file to bulk import leads. Download the template to see the required format.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Button variant="outline" onClick={downloadCSVTemplate} className="w-full bg-transparent">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor="csv-file">Select CSV File</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {uploadProgress && <p className="text-sm text-muted-foreground">{uploadProgress}</p>}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsUploadDialogOpen(false)
                      setCsvFile(null)
                      setUploadProgress("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCSVUpload} disabled={!csvFile || !!uploadProgress}>
                    Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
                  <DialogDescription>
                    {editingLead ? "Update lead information" : "Enter the details for the new lead"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
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
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                        <Label htmlFor="state">State (Optional)</Label>
                        <Select
                          value={formData.stateId}
                          onValueChange={(value) => setFormData({ ...formData, stateId: value, cityId: "" })}
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
                        <Label htmlFor="city">City (Optional)</Label>
                        <Select
                          value={formData.cityId}
                          onValueChange={(value) => setFormData({ ...formData, cityId: value })}
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
                      <Label htmlFor="interestedCourses">Interested Courses (comma-separated)</Label>
                      <Input
                        id="interestedCourses"
                        placeholder="Computer Science, MBA, Engineering"
                        value={formData.interestedCourses}
                        onChange={(e) => setFormData({ ...formData, interestedCourses: e.target.value })}
                      />
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
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes about this lead"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingLead ? "Update" : "Add"} Lead</Button>
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
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interested Courses</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No leads found. Add your first lead or upload from CSV.
                  </TableCell>
                </TableRow>
              ) : (
                displayLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>
                      {getCityName(lead.cityId || "")}
                      {lead.cityId && ", "}
                      {getStateName(lead.stateId || "")}
                      {lead.stateId && ", "}
                      {getCountryName(lead.countryId)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
                    </TableCell>
                    <TableCell>{lead.interestedCourses.slice(0, 2).join(", ")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(lead)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)}>
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
