"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2, Eye, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import type { University, Country, State, City, Faculty, User } from "@/lib/types"
import { UserIcon } from "lucide-react"

export default function UniversitiesPage() {
  const { userData } = useAuth()
  const { toast } = useToast()
  const [universities, setUniversities] = useState<University[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [consultants, setConsultants] = useState<User[]>([])
  const [recognitions, setRecognitions] = useState<{ id: string; name: string }[]>([])
  const [mediums, setMediums] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null)
  const [viewingUniversity, setViewingUniversity] = useState<University | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    websiteUrl: "",
    countryId: "",
    stateId: "",
    cityId: "",
    address: "",
    recognitions: [] as string[],
    mediumOfTeaching: [] as string[],
    courseDuration: "6 years",
    eligibilityCriteria: "",
    neetRequired: false,
    currentlyEnrolledStudents: 0,
    intakePeriod: "January" as "January" | "September",
    youtubeVideoUrl: "",
    facultyIds: [] as string[],
    feesStructure: {
      year1: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
      year2: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
      year3: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
      year4: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
      year5: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
      year6: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
    },
    commissionPercentage: 0,
    assignedConsultants: [] as string[],
  })

  useEffect(() => {
    loadData()
  }, [userData])

  const loadData = async () => {
    try {
      const [countriesSnap, facultiesSnap, consultantsSnap, recognitionsSnap, mediumsSnap] = await Promise.all([
        getDocs(query(collection(db, "countries"), orderBy("name"))),
        getDocs(query(collection(db, "faculties"), orderBy("name"))),
        getDocs(query(collection(db, "users"), where("role", "==", "consultant"))),
        getDocs(query(collection(db, "recognitions"), orderBy("name"))),
        getDocs(query(collection(db, "mediums"), orderBy("name"))),
      ])

      setCountries(countriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Country[])
      setFaculties(facultiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Faculty[])
      setConsultants(consultantsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[])
      setRecognitions(recognitionsSnap.docs.map((doc) => ({ id: doc.id, name: doc.data().name || "" })))
      setMediums(mediumsSnap.docs.map((doc) => ({ id: doc.id, name: doc.data().name || "" })))

      await loadUniversities()
    } catch (error) {
      console.error("Failed to load data", error)
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const loadUniversities = async () => {
    try {
      let q = query(collection(db, "universities"), orderBy("name"))

      if (userData?.role === "consultant" && userData.assignedUniversityIds) {
        if (userData.assignedUniversityIds.length === 0) {
          setUniversities([])
          return
        }
        q = query(collection(db, "universities"), where("__name__", "in", userData.assignedUniversityIds))
      }

      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as University[]
      setUniversities(data)
    } catch (error) {
      console.error("Failed to load universities", error)
    }
  }

  const loadStates = async (countryId: string) => {
    const q = query(collection(db, "states"), where("countryId", "==", countryId), orderBy("name"))
    const snapshot = await getDocs(q)
    setStates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as State[])
  }

  const loadCities = async (stateId: string) => {
    const q = query(collection(db, "cities"), where("stateId", "==", stateId), orderBy("name"))
    const snapshot = await getDocs(q)
    setCities(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as City[])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

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

      setDialogOpen(false)
      resetForm()
      loadUniversities()
    } catch (error) {
      console.error("Failed to save university", error)
      toast({ title: "Error", description: "Failed to save university", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (university: University) => {
    setEditingUniversity(university)
    setFormData({
      name: university.name,
      logoUrl: university.logoUrl || "",
      websiteUrl: university.websiteUrl || "",
      countryId: university.countryId,
      stateId: university.stateId,
      cityId: university.cityId,
      address: university.address,
      recognitions: university.recognitions || [],
      mediumOfTeaching: university.mediumOfTeaching || [],
      courseDuration: university.courseDuration || "6 years",
      eligibilityCriteria: university.eligibilityCriteria || "",
      neetRequired: university.neetRequired || false,
      currentlyEnrolledStudents: university.currentlyEnrolledStudents || 0,
      intakePeriod: university.intakePeriod || "January",
      youtubeVideoUrl: university.youtubeVideoUrl || "",
      facultyIds: university.facultyIds || [],
      feesStructure: university.feesStructure || {
        year1: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year2: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year3: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year4: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year5: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year6: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
      },
      commissionPercentage: university.commissionPercentage || 0,
      assignedConsultants: university.assignedConsultants || [],
    })
    loadStates(university.countryId)
    loadCities(university.stateId)
    setDialogOpen(true)
  }

  const handleView = (university: University) => {
    setViewingUniversity(university)
    setViewDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this university?")) return

    try {
      await deleteDoc(doc(db, "universities", id))
      toast({ title: "Success", description: "University deleted successfully" })
      loadUniversities()
    } catch (error) {
      console.error("Failed to delete university", error)
      toast({ title: "Error", description: "Failed to delete university", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      logoUrl: "",
      websiteUrl: "",
      countryId: "",
      stateId: "",
      cityId: "",
      address: "",
      recognitions: [],
      mediumOfTeaching: [],
      courseDuration: "6 years",
      eligibilityCriteria: "",
      neetRequired: false,
      currentlyEnrolledStudents: 0,
      intakePeriod: "January",
      youtubeVideoUrl: "",
      facultyIds: [],
      feesStructure: {
        year1: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year2: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year3: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year4: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year5: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
        year6: { tuitionFees: 0, hostelFees: 0, messCharges: 0, otherCharges: 0 },
      },
      commissionPercentage: 0,
      assignedConsultants: [],
    })
    setEditingUniversity(null)
    setStates([])
    setCities([])
  }

  const toggleRecognition = (recognition: string) => {
    setFormData((prev) => ({
      ...prev,
      recognitions: prev.recognitions.includes(recognition)
        ? prev.recognitions.filter((r) => r !== recognition)
        : [...prev.recognitions, recognition],
    }))
  }

  const toggleMedium = (medium: string) => {
    setFormData((prev) => ({
      ...prev,
      mediumOfTeaching: prev.mediumOfTeaching.includes(medium)
        ? prev.mediumOfTeaching.filter((m) => m !== medium)
        : [...prev.mediumOfTeaching, medium],
    }))
  }

  const toggleFaculty = (facultyId: string) => {
    setFormData((prev) => ({
      ...prev,
      facultyIds: prev.facultyIds.includes(facultyId)
        ? prev.facultyIds.filter((id) => id !== facultyId)
        : [...prev.facultyIds, facultyId],
    }))
  }

  const toggleConsultant = (consultantId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedConsultants: prev.assignedConsultants.includes(consultantId)
        ? prev.assignedConsultants.filter((id) => id !== consultantId)
        : [...prev.assignedConsultants, consultantId],
    }))
  }

  const updateYearFees = (year: string, field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      feesStructure: {
        ...prev.feesStructure,
        [year]: {
          ...prev.feesStructure[year as keyof typeof prev.feesStructure],
          [field]: value,
        },
      },
    }))
  }

  const calculateTotalFees = () => {
    let total = 0
    Object.values(formData.feesStructure).forEach((yearFees) => {
      total += yearFees.tuitionFees + yearFees.hostelFees + yearFees.messCharges + yearFees.otherCharges
    })
    return total
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MBBS Universities</h1>
          <p className="text-muted-foreground">
            {userData?.role === "super_admin"
              ? "Manage MBBS universities and programs"
              : "View your assigned universities"}
          </p>
        </div>

        {userData?.role === "super_admin" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add University
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingUniversity ? "Edit University" : "Add University"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6 py-4">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="name">University Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          type="url"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="websiteUrl">Website URL</Label>
                        <Input
                          id="websiteUrl"
                          type="url"
                          value={formData.websiteUrl}
                          onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Location</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Country *</Label>
                        <Select
                          value={formData.countryId}
                          onValueChange={(value) => {
                            setFormData({ ...formData, countryId: value, stateId: "", cityId: "" })
                            loadStates(value)
                          }}
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
                      <div>
                        <Label>State *</Label>
                        <Select
                          value={formData.stateId}
                          onValueChange={(value) => {
                            setFormData({ ...formData, stateId: value, cityId: "" })
                            loadCities(value)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>City *</Label>
                        <Select
                          value={formData.cityId}
                          onValueChange={(value) => setFormData({ ...formData, cityId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recognitions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recognitions *</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {recognitions.map((recognition) => (
                        <div key={recognition.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`recognition-${recognition.id}`}
                            checked={formData.recognitions?.includes(recognition.name) || false}
                            onCheckedChange={() => toggleRecognition(recognition.name)}
                          />
                          <Label htmlFor={`recognition-${recognition.id}`}>{recognition.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medium of Teaching */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Medium of Teaching *</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {mediums.map((medium) => (
                        <div key={medium.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`medium-${medium.id}`}
                            checked={formData.mediumOfTeaching?.includes(medium.name) || false}
                            onCheckedChange={() => toggleMedium(medium.name)}
                          />
                          <Label htmlFor={`medium-${medium.id}`}>{medium.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Course Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="courseDuration">Course Duration *</Label>
                        <Input
                          id="courseDuration"
                          value={formData.courseDuration}
                          onChange={(e) => setFormData({ ...formData, courseDuration: e.target.value })}
                          placeholder="e.g., 6 years"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentlyEnrolledStudents">Currently Enrolled Students *</Label>
                        <Input
                          id="currentlyEnrolledStudents"
                          type="number"
                          min="0"
                          value={formData.currentlyEnrolledStudents}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentlyEnrolledStudents: Number.parseInt(e.target.value) || 0,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                        <Textarea
                          id="eligibilityCriteria"
                          value={formData.eligibilityCriteria}
                          onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                          placeholder="Enter eligibility requirements..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>NEET Required *</Label>
                        <RadioGroup
                          value={formData.neetRequired?.toString() || "false"}
                          onValueChange={(value) => setFormData({ ...formData, neetRequired: value === "true" })}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="neet-yes" />
                            <Label htmlFor="neet-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="neet-no" />
                            <Label htmlFor="neet-no">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div>
                        <Label>Intake Period *</Label>
                        <RadioGroup
                          value={formData.intakePeriod || "January"}
                          onValueChange={(value) =>
                            setFormData({ ...formData, intakePeriod: value as "January" | "September" })
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="January" id="intake-jan" />
                            <Label htmlFor="intake-jan">January</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="September" id="intake-sep" />
                            <Label htmlFor="intake-sep">September</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="youtubeVideoUrl">YouTube Video URL</Label>
                        <Input
                          id="youtubeVideoUrl"
                          type="url"
                          value={formData.youtubeVideoUrl}
                          onChange={(e) => setFormData({ ...formData, youtubeVideoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Faculties */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Faculties</h3>
                    <div className="max-h-40 overflow-y-auto rounded-md border p-4">
                      {faculties.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No faculties available. Add faculties first.</p>
                      ) : (
                        <div className="space-y-2">
                          {faculties.map((faculty) => (
                            <div key={faculty.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`faculty-${faculty.id}`}
                                checked={formData.facultyIds.includes(faculty.id)}
                                onCheckedChange={() => toggleFaculty(faculty.id)}
                              />
                              <Label htmlFor={`faculty-${faculty.id}`} className="text-sm">
                                {faculty.name} - {faculty.designation}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fees Structure */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fees Structure (Year-wise) *</h3>
                    <div className="space-y-4">
                      {["year1", "year2", "year3", "year4", "year5", "year6"].map((year, index) => (
                        <div key={year} className="rounded-lg border p-4">
                          <h4 className="mb-3 font-medium">Year {index + 1}</h4>
                          <div className="grid grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs">Tuition Fees</Label>
                              <Input
                                type="number"
                                min="0"
                                value={formData.feesStructure[year as keyof typeof formData.feesStructure].tuitionFees}
                                onChange={(e) =>
                                  updateYearFees(year, "tuitionFees", Number.parseFloat(e.target.value) || 0)
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Hostel Fees</Label>
                              <Input
                                type="number"
                                min="0"
                                value={formData.feesStructure[year as keyof typeof formData.feesStructure].hostelFees}
                                onChange={(e) =>
                                  updateYearFees(year, "hostelFees", Number.parseFloat(e.target.value) || 0)
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Mess Charges</Label>
                              <Input
                                type="number"
                                min="0"
                                value={formData.feesStructure[year as keyof typeof formData.feesStructure].messCharges}
                                onChange={(e) =>
                                  updateYearFees(year, "messCharges", Number.parseFloat(e.target.value) || 0)
                                }
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Other Charges</Label>
                              <Input
                                type="number"
                                min="0"
                                value={formData.feesStructure[year as keyof typeof formData.feesStructure].otherCharges}
                                onChange={(e) =>
                                  updateYearFees(year, "otherCharges", Number.parseFloat(e.target.value) || 0)
                                }
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="rounded-lg border bg-muted p-4">
                        <p className="text-sm font-medium">
                          Total 6-Year Fees: ${calculateTotalFees().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Commission */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Commission</h3>
                    <div>
                      <Label htmlFor="commissionPercentage">Commission Percentage *</Label>
                      <Input
                        id="commissionPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.commissionPercentage}
                        onChange={(e) =>
                          setFormData({ ...formData, commissionPercentage: Number.parseFloat(e.target.value) || 0 })
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Assigned Consultants */}
                  {userData?.role === "super_admin" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Assign Consultants</h3>
                      <div className="max-h-40 overflow-y-auto rounded-md border p-4">
                        {consultants.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No consultants available.</p>
                        ) : (
                          <div className="space-y-2">
                            {consultants.map((consultant) => (
                              <div key={consultant.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`consultant-${consultant.id}`}
                                  checked={formData.assignedConsultants.includes(consultant.id)}
                                  onCheckedChange={() => toggleConsultant(consultant.id)}
                                />
                                <Label htmlFor={`consultant-${consultant.id}`} className="text-sm">
                                  {consultant.name} ({consultant.email})
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {editingUniversity ? "Update" : "Add"} University
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Universities Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Intake</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : universities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No universities found. Add your first university.
                </TableCell>
              </TableRow>
            ) : (
              universities.map((university) => {
                const country = countries.find((c) => c.id === university.countryId)
                return (
                  <TableRow key={university.id}>
                    <TableCell>
                      {university.logoUrl ? (
                        <img
                          src={university.logoUrl || "/placeholder.svg"}
                          alt={university.name}
                          className="h-10 w-10 rounded border object-contain"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded border bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{university.name}</TableCell>
                    <TableCell>{country?.name || "N/A"}</TableCell>
                    <TableCell>{university.currentlyEnrolledStudents}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{university.intakePeriod}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(university)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {userData?.role === "super_admin" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(university)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(university.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* View University Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>University Details</DialogTitle>
          </DialogHeader>
          {viewingUniversity && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {viewingUniversity.logoUrl && (
                  <img
                    src={viewingUniversity.logoUrl || "/placeholder.svg"}
                    alt={viewingUniversity.name}
                    className="h-20 w-20 rounded border object-contain"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{viewingUniversity.name}</h2>
                  {viewingUniversity.websiteUrl && (
                    <a
                      href={viewingUniversity.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-sm text-muted-foreground">{viewingUniversity.address}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Recognitions</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingUniversity.recognitions?.map((r) => (
                      <Badge key={r} variant="secondary">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Medium of Teaching</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingUniversity.mediumOfTeaching?.map((m) => (
                      <Badge key={m} variant="outline">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Course Duration</h3>
                    <p className="text-sm">{viewingUniversity.courseDuration}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">NEET Required</h3>
                    <p className="text-sm">{viewingUniversity.neetRequired ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Currently Enrolled</h3>
                    <p className="text-sm">{viewingUniversity.currentlyEnrolledStudents} students</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Intake Period</h3>
                    <p className="text-sm">{viewingUniversity.intakePeriod}</p>
                  </div>
                </div>

                {viewingUniversity.eligibilityCriteria && (
                  <div>
                    <h3 className="font-semibold">Eligibility Criteria</h3>
                    <p className="text-sm text-muted-foreground">{viewingUniversity.eligibilityCriteria}</p>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 font-semibold">Fees Structure</h3>
                  <div className="space-y-2">
                    {Object.entries(viewingUniversity.feesStructure).map(([year, fees], index) => (
                      <div key={year} className="rounded border p-3">
                        <h4 className="mb-2 text-sm font-medium">Year {index + 1}</h4>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Tuition:</span> ${fees.tuitionFees.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Hostel:</span> ${fees.hostelFees.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Mess:</span> ${fees.messCharges.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Other:</span> ${fees.otherCharges.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Commission</h3>
                  <p className="text-sm">{viewingUniversity.commissionPercentage}%</p>
                </div>

                {viewingUniversity.facultyIds.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Faculties</h3>
                    <div className="mt-2 space-y-2">
                      {viewingUniversity.facultyIds.map((fid) => {
                        const faculty = faculties.find((f) => f.id === fid)
                        return faculty ? (
                          <div key={fid} className="flex items-center gap-2 rounded border p-2">
                            {faculty.profileImageUrl ? (
                              <img
                                src={faculty.profileImageUrl || "/placeholder.svg"}
                                alt={faculty.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <UserIcon className="h-4 w-4" />
                              </div>
                            )}
                            <div className="text-sm">
                              <p className="font-medium">{faculty.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {faculty.designation} - {faculty.department}
                              </p>
                            </div>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                {viewingUniversity.youtubeVideoUrl && (
                  <div>
                    <h3 className="font-semibold">Video</h3>
                    <a
                      href={viewingUniversity.youtubeVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
