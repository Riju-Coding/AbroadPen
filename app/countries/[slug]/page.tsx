"use client"

import type React from "react"

import { use, useState, useEffect } from "react"
import { collection, getDocs, query, where, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Building2, Info, Globe2, GraduationCap } from "lucide-react"
import Link from "next/link"
import { slugify } from "@/lib/slugify"
import type { Country, University } from "@/lib/types"

export default function CountryDetailsPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const unwrappedParams = params instanceof Promise ? use(params) : params
  const slug = unwrappedParams.slug

  const [country, setCountry] = useState<Country | null>(null)
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [enquiryLoading, setEnquiryLoading] = useState(false)
  const { toast } = useToast()

  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const countriesSnap = await getDocs(collection(db, "countries"))
        const foundCountry = countriesSnap.docs.find((doc) => slugify(doc.data().name) === slug)

        if (foundCountry) {
          const countryData = { id: foundCountry.id, ...foundCountry.data() } as Country
          setCountry(countryData)

          // Fetch Universities for this country using the actual ID
          const q = query(collection(db, "universities"), where("countryId", "==", foundCountry.id))
          const uniSnapshot = await getDocs(q)
          setUniversities(uniSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as University[])
        }
      } catch (error) {
        console.error("Error fetching country data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnquiryLoading(true)

    try {
      await addDoc(collection(db, "enquiries"), {
        ...enquiryForm,
        countryId: country?.id,
        countryName: country?.name,
        type: "country_specific",
        createdAt: new Date(),
        status: "new",
      })

      toast({
        title: "Enquiry Sent!",
        description: `We've received your enquiry for ${country?.name}.`,
      })
      setEnquiryForm({ name: "", email: "", phone: "", city: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send enquiry.",
        variant: "destructive",
      })
    } finally {
      setEnquiryLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!country) return <div className="min-h-screen flex items-center justify-center">Country not found.</div>

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Banner */}
      <section className="bg-[#37476b] py-24 px-4 md:px-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Globe2 className="w-full h-full text-white" strokeWidth={0.1} />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-[3rem] overflow-hidden bg-white shadow-2xl border-4 border-white/20 flex items-center justify-center p-4">
            {country.flagUrl ? (
              <img
                src={country.flagUrl || "/placeholder.svg"}
                alt={`${country.name} flag`}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-8xl">{country.flag || "🌍"}</span>
            )}
          </div>
          <div className="space-y-6 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 bg-[#f2c62f]/20 text-[#f2c62f] px-4 py-2 rounded-full font-semibold text-sm">
              <MapPin className="h-4 w-4" />
              Destined for Excellence
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-tight">
              Study in <br />
              <span className="text-[#f2c62f]">{country.name}</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl font-medium leading-relaxed">
              Explore world-class academic opportunities and cultural richness in {country.name}.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-20 grid lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-20">
          {/* About Section */}
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#37476b]/5">
            <h2 className="text-3xl font-black flex items-center gap-4 text-[#37476b] mb-8">
              <div className="w-12 h-12 bg-[#37476b]/5 rounded-2xl flex items-center justify-center">
                <Info className="h-6 w-6 text-[#37476b]" />
              </div>
              About {country.name}
            </h2>
            <div className="prose prose-lg prose-slate max-w-none">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {country.details ||
                  `${country.name} is one of the most preferred destinations for international students, offering world-class education with state-of-the-art facilities. The country is known for its cultural diversity, safety, and globally recognized degrees.`}
              </p>
            </div>
          </section>

          {/* Top Universities Section */}
          <section className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black flex items-center gap-4 text-[#37476b]">
                <div className="w-12 h-12 bg-[#37476b]/5 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-[#37476b]" />
                </div>
                Top Universities
              </h2>
              <span className="bg-[#f2c62f]/10 text-[#f2c62f] px-4 py-1 rounded-full text-sm font-bold">
                {universities.length} Institutions
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {universities.length === 0 ? (
                <div className="col-span-2 py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-[#37476b]/10">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-[#37476b]/20" />
                  <p className="text-muted-foreground font-medium">No universities listed for this country yet.</p>
                </div>
              ) : (
                universities.map((uni) => (
                  <Link key={uni.id} href={`/universities/${slugify(uni.name)}`} className="group">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#37476b]/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#37476b]/5 mb-6 bg-white flex items-center justify-center p-3 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={uni.logoUrl || "/placeholder.svg?height=160&width=160&query=university logo"}
                          alt={uni.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="font-black text-xl text-[#37476b] mb-3 leading-tight group-hover:text-[#f2c62f] transition-colors">
                        {uni.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mt-auto">
                        <MapPin className="h-4 w-4 text-[#f2c62f]" />
                        {uni.address}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sticky Enquiry Sidebar */}
      </div>
    </div>
  )
}
