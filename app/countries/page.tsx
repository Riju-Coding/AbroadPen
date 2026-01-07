"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Globe2, ArrowRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { slugify } from "@/lib/slugify"
import type { Country } from "@/lib/types"

function CountriesContent() {
  const [countries, setCountries] = useState<Country[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCountries() {
      try {
        const q = query(collection(db, "countries"), orderBy("name"))
        const snapshot = await getDocs(q)
        setCountries(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Country[])
      } catch (error) {
        console.error("Error fetching countries:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCountries()
  }, [])

  const filteredCountries = countries.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-4 md:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Explore Destinations</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect country for your international education journey.
          </p>
          <div className="relative max-w-md mx-auto mt-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              className="pl-10 h-12 bg-background shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Globe2 className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-2xl font-bold">No countries found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCountries.map((country) => (
              <Link key={country.id} href={`/countries/${slugify(country.name)}`}>
                <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border-border/50 bg-card">
                  <CardContent className="p-0">
                    <div className="h-48 bg-muted relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        {country.flagUrl ? (
                          <img
                            src={country.flagUrl || "/placeholder.svg"}
                            alt={`${country.name} flag`}
                            className="h-32 w-32 object-contain group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-7xl group-hover:scale-110 transition-transform duration-500">🌍</span>
                        )}
                      </div>
                    </div>
                    <div className="p-8 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                          {country.name}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {country.details || `Explore top-tier medical and research universities in ${country.name}.`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function CountriesPage() {
  return (
    <Suspense fallback={null}>
      <CountriesContent />
    </Suspense>
  )
}
