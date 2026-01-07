"use client"

import { Button } from "@/components/ui/button"
import { slugify } from "@/lib/slugify"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, MapPin, Search, Filter, ArrowRight } from "lucide-react"
import type { University, Country } from "@/lib/types"

function UniversitiesContent() {
  const [universities, setUniversities] = useState<University[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("all")

  useEffect(() => {
    async function loadData() {
      try {
        const [uniSnap, countrySnap] = await Promise.all([
          getDocs(query(collection(db, "universities"), orderBy("name"))),
          getDocs(query(collection(db, "countries"), orderBy("name"))),
        ])

        setUniversities(uniSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as University[])
        setCountries(countrySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Country[])
      } catch (error) {
        console.error("Error loading universities:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCountry = selectedCountry === "all" || uni.countryId === selectedCountry
    return matchesSearch && matchesCountry
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 px-4 md:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">University Directory</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find and compare top-tier international universities for your career.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-xl border border-border flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by university name..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="h-12">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by country" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-96 bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredUniversities.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto opacity-20" />
            <h3 className="text-2xl font-bold">No universities found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUniversities.map((uni) => {
              const country = countries.find((c) => c.id === uni.countryId)
              return (
                <Card
                  key={uni.id}
                  className="group hover:shadow-xl transition-shadow border border-border/50 overflow-hidden flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={uni.logoUrl || "/placeholder.svg?height=300&width=500&query=university building"}
                      alt={uni.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                    {country && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1.5 shadow-sm">
                        <span>{country.flag || "🌍"}</span>
                        {country.name}
                      </div>
                    )}
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {uni.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{uni.address || "International Location"}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {uni.recognitions?.slice(0, 2).map((r) => (
                        <span
                          key={r}
                          className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Link href={`/universities/${slugify(uni.name)}`} className="w-full">
                      <Button className="w-full group/btn font-bold gap-2">
                        View Details
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default function UniversityListingPage() {
  return (
    <Suspense fallback={null}>
      <UniversitiesContent />
    </Suspense>
  )
}
