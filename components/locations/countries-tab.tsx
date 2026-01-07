"use client"

import type React from "react"
import { useToast } from "@/hooks/use-toast"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react"
import type { Country, University } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

export function CountriesTab() {
  const [countries, setCountries] = useState<Country[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingCountry, setViewingCountry] = useState<Country | null>(null)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    flagUrl: "",
    details: "",
    topUniversities: [] as string[],
  })
  const [countryUniversities, setCountryUniversities] = useState<University[]>([])
  const { toast } = useToast()

  useEffect(() => {
    loadCountries()
    loadUniversities()
  }, [])

  useEffect(() => {
    if (editingCountry) {
      filterUniversitiesByCountry(editingCountry.id)
    }
  }, [editingCountry, universities])

  const loadCountries = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "countries"))
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Country[]
      setCountries(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load countries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUniversities = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "universities"))
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as University[]
      setUniversities(data)
    } catch (error) {
      console.error("Failed to load universities:", error)
    }
  }

  const filterUniversitiesByCountry = (countryId: string) => {
    const filtered = universities.filter((uni) => uni.countryId === countryId)
    setCountryUniversities(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCountry) {
        await updateDoc(doc(db, "countries", editingCountry.id), {
          ...formData,
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Country updated successfully" })
      } else {
        await addDoc(collection(db, "countries"), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast({ title: "Success", description: "Country added successfully" })
      }

      setIsDialogOpen(false)
      setFormData({ name: "", code: "", flagUrl: "", details: "", topUniversities: [] })
      setEditingCountry(null)
      setCountryUniversities([])
      loadCountries()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save country",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (country: Country) => {
    setEditingCountry(country)
    setFormData({
      name: country.name,
      code: country.code,
      flagUrl: country.flagUrl || "",
      details: country.details || "",
      topUniversities: country.topUniversities || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this country?")) return

    try {
      await deleteDoc(doc(db, "countries", id))
      toast({ title: "Success", description: "Country deleted successfully" })
      loadCountries()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete country",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setFormData({ name: "", code: "", flagUrl: "", details: "", topUniversities: [] })
    setEditingCountry(null)
    setCountryUniversities([])
  }

  const handleView = (country: Country) => {
    setViewingCountry(country)
    setIsViewDialogOpen(true)
  }

  const toggleUniversitySelection = (universityId: string) => {
    setFormData((prev) => {
      const currentSelection = prev.topUniversities || []
      const isSelected = currentSelection.includes(universityId)

      if (isSelected) {
        return {
          ...prev,
          topUniversities: currentSelection.filter((id) => id !== universityId),
        }
      } else {
        // Limit to 10 universities
        if (currentSelection.length >= 10) {
          toast({
            title: "Limit Reached",
            description: "You can only select up to 10 top universities",
            variant: "destructive",
          })
          return prev
        }
        return {
          ...prev,
          topUniversities: [...currentSelection, universityId],
        }
      }
    })
  }

  const getUniversityName = (universityId: string) => {
    const university = universities.find((uni) => uni.id === universityId)
    return university?.name || "Unknown University"
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Countries</CardTitle>
          <CardDescription>Manage all countries in the system</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Country
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCountry ? "Edit Country" : "Add New Country"}</DialogTitle>
              <DialogDescription>
                {editingCountry ? "Update country information" : "Enter the details for the new country"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Country Name</Label>
                  <Input
                    id="name"
                    placeholder="United States"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Country Code</Label>
                  <Input
                    id="code"
                    placeholder="US"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flagUrl">Flag Image URL</Label>
                  <Input
                    id="flagUrl"
                    placeholder="https://flagcdn.com/w320/us.png"
                    value={formData.flagUrl}
                    onChange={(e) => setFormData({ ...formData, flagUrl: e.target.value })}
                  />
                  {formData.flagUrl && (
                    <div className="mt-2 flex items-center gap-3 rounded-md border p-3 bg-muted/30">
                      <img
                        src={formData.flagUrl || "/placeholder.svg"}
                        alt="Flag preview"
                        className="h-10 w-16 object-cover rounded border border-border shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=40&width=64"
                        }}
                      />
                      <span className="text-sm text-muted-foreground">Flag preview</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Country Details</Label>
                  <RichTextEditor
                    value={formData.details}
                    onChange={(value) => setFormData({ ...formData, details: value })}
                    placeholder="Add detailed information about the country..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Use the toolbar to format text with headings, lists, bold, italic, etc.
                  </p>
                </div>

                {editingCountry && (
                  <div className="space-y-2">
                    <Label>Top Universities (Max 10)</Label>
                    <p className="text-sm text-muted-foreground">
                      Select up to 10 universities from {formData.name} to feature as top universities
                    </p>

                    {/* Selected universities display */}
                    {formData.topUniversities.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                        {formData.topUniversities.map((uniId) => (
                          <Badge key={uniId} variant="secondary" className="gap-1">
                            {getUniversityName(uniId)}
                            <button
                              type="button"
                              onClick={() => toggleUniversitySelection(uniId)}
                              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Available universities list */}
                    <div className="border rounded-md max-h-60 overflow-y-auto">
                      {countryUniversities.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No universities found for this country. Add universities first.
                        </div>
                      ) : (
                        <div className="divide-y">
                          {countryUniversities.map((university) => {
                            const isSelected = formData.topUniversities.includes(university.id)
                            return (
                              <div
                                key={university.id}
                                className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                                  isSelected ? "bg-primary/10" : ""
                                }`}
                                onClick={() => toggleUniversitySelection(university.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{university.name}</p>
                                    <p className="text-sm text-muted-foreground">{university.address}</p>
                                  </div>
                                  {isSelected && <Badge variant="default">Selected</Badge>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Selected: {formData.topUniversities.length}/10</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit">{editingCountry ? "Update" : "Add"} Country</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flag</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No countries found. Add your first country to get started.
                </TableCell>
              </TableRow>
            ) : (
              countries.map((country) => (
                <TableRow key={country.id}>
                  <TableCell>
                    {country.flagUrl ? (
                      <img
                        src={country.flagUrl || "/placeholder.svg"}
                        alt={`${country.name} flag`}
                        className="h-6 w-10 object-cover rounded border border-border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=24&width=40"
                        }}
                      />
                    ) : (
                      <div className="h-6 w-10 rounded border border-dashed border-muted-foreground/30 bg-muted/30" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{country.name}</TableCell>
                  <TableCell>{country.code}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleView(country)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(country)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(country.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {viewingCountry?.flagUrl && (
                <img
                  src={viewingCountry.flagUrl || "/placeholder.svg"}
                  alt={`${viewingCountry.name} flag`}
                  className="h-8 w-12 object-cover rounded border border-border"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=32&width=48"
                  }}
                />
              )}
              {viewingCountry?.name}
            </DialogTitle>
            <DialogDescription>Country Code: {viewingCountry?.code}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {viewingCountry?.topUniversities && viewingCountry.topUniversities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Top Universities</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingCountry.topUniversities.map((uniId) => (
                    <Badge key={uniId} variant="secondary">
                      {getUniversityName(uniId)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {viewingCountry?.details ? (
              <div>
                <h3 className="font-semibold mb-3">Country Details</h3>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-4 border"
                  dangerouslySetInnerHTML={{ __html: viewingCountry.details }}
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No details available for this country.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                handleEdit(viewingCountry!)
              }}
            >
              Edit Country
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
