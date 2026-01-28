"use client"

import type React from "react"
import { useState, useEffect, use } from "react" // <-- IMPORT 'use' HOOK
import Link from "next/link"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { slugify } from "@/lib/slugify"
import type { University, Country } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  GraduationCap,
  MapPin,
  Globe,
  CheckCircle2,
  Clock,
  Calendar,
  Target,
  BookOpen,
  Award,
  CircleDollarSign,
  UserCheck,
} from "lucide-react"

// Helper to format numbers as currency (e.g., USD)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Helper to convert YouTube URL to embeddable URL
const getEmbedUrl = (url: string) => {
  if (!url) return ""
  const videoIdMatch = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : ""
}

export default function UniversityDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params) // <-- UNWRAP THE PROMISE

  const [university, setUniversity] = useState<University | null>(null)
  const [country, setCountry] = useState<Country | null>(null)
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
    async function fetchUniversityData() {
      if (!slug) return
      try {
        const universitiesSnap = await getDocs(collection(db, "universities"))
        const foundUniversityDoc = universitiesSnap.docs.find((doc) => slugify(doc.data().name) === slug)

        if (foundUniversityDoc) {
          const uniData = { id: foundUniversityDoc.id, ...foundUniversityDoc.data() } as University
          setUniversity(uniData)

          // Fetch the country data based on countryId
          if (uniData.countryId) {
            const countriesSnap = await getDocs(collection(db, "countries"))
            const foundCountryDoc = countriesSnap.docs.find((doc) => doc.id === uniData.countryId)
            if (foundCountryDoc) {
              setCountry({ id: foundCountryDoc.id, ...foundCountryDoc.data() } as Country)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching university:", error)
        toast({ title: "Error", description: "Could not load university data.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchUniversityData()
  }, [slug, toast])

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnquiryLoading(true)
    try {
      await addDoc(collection(db, "enquiries"), {
        ...enquiryForm,
        universityId: university?.id,
        universityName: university?.name,
        type: "university_specific",
        createdAt: new Date(),
        status: "new",
      })
      toast({
        title: "Application Started!",
        description: `Your interest in ${university?.name} has been recorded. We will contact you shortly.`,
      })
      setEnquiryForm({ name: "", email: "", phone: "", city: "" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit enquiry.", variant: "destructive" })
    } finally {
      setEnquiryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-[#37476b]">Loading University Details...</p>
      </div>
    )
  }

  if (!university) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <h1 className="text-3xl font-bold text-[#37476b]">University Not Found</h1>
        <p className="text-muted-foreground">The university you are looking for does not exist.</p>
        <Link href="/">
          <Button>Go Back Home</Button>
        </Link>
      </div>
    )
  }

  const totalFee = university.feesStructure
    ? Object.values(university.feesStructure).reduce(
        (sum, year) => sum + year.tuitionFees + year.hostelFees + year.messCharges + year.otherCharges,
        0,
      )
    : 0

  const embedUrl = getEmbedUrl(university.youtubeVideoUrl || "")

  const keyInfo = [
    {
      icon: Clock,
      label: "Duration",
      value: university.courseDuration || "N/A",
    },
    {
      icon: Calendar,
      label: "Intake",
      value: university.intakePeriod || "N/A",
    },
    {
      icon: BookOpen,
      label: "Medium",
      value: university.mediumOfTeaching?.join(", ") || "N/A",
    },
    {
      icon: UserCheck,
      label: "NEET Required",
      value: university.neetRequired ? "Yes" : "No",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Banner / Header */}
      <section className="bg-[#37476b] text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <GraduationCap className="w-full h-full text-white" strokeWidth={0.1} />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 z-10 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-white rounded-3xl p-4 shadow-2xl border-4 border-white/50">
              <img
                src={university.logoUrl || "/placeholder.svg"}
                alt={`${university.name} Logo`}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center md:text-left space-y-3">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight">{university.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-[#f2c62f] font-semibold">
                {country && (
                  <Link
                    href={`/countries/${slugify(country.name)}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Globe className="h-5 w-5" />
                    <span>{country.name}</span>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{university.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Key Info Section */}
          <Card className="rounded-3xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-[#37476b]/5 border-b p-6">
              <CardTitle className="text-2xl font-bold text-[#37476b]">University at a Glance</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              {keyInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="bg-[#37476b]/10 text-[#37476b] p-3 rounded-full">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                    <p className="font-bold text-lg text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fee Structure */}
          <Card className="rounded-3xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-[#37476b]/5 border-b p-6">
              <CardTitle className="text-2xl font-bold text-[#37476b]">Fee Structure</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 font-semibold text-sm text-muted-foreground">Year</th>
                      <th className="p-4 font-semibold text-sm text-muted-foreground">Tuition Fees</th>
                      <th className="p-4 font-semibold text-sm text-muted-foreground">Hostel & Mess</th>
                      <th className="p-4 font-semibold text-sm text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {university.feesStructure &&
                      Object.entries(university.feesStructure).map(([year, fees]) => (
                        <tr key={year} className="border-t">
                          <td className="p-4 font-bold capitalize">{year.replace("year", "Year ")}</td>
                          <td className="p-4">{formatCurrency(fees.tuitionFees)}</td>
                          <td className="p-4">{formatCurrency(fees.hostelFees + fees.messCharges)}</td>
                          <td className="p-4 font-semibold">
                            {formatCurrency(fees.tuitionFees + fees.hostelFees + fees.messCharges + fees.otherCharges)}
                          </td>
                        </tr>
                      ))}
                    <tr className="border-t bg-[#f2c62f]/20 font-bold">
                      <td colSpan={3} className="p-4 text-right text-[#37476b]">
                        Total Course Fee
                      </td>
                      <td className="p-4 text-xl text-[#37476b]">{formatCurrency(totalFee)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recognitions & Eligibility */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-3xl shadow-lg border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#37476b]">
                  <Award className="h-6 w-6" />
                  Recognitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {university.recognitions?.map((rec) => (
                    <li key={rec} className="flex items-center gap-3 font-medium">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="rounded-3xl shadow-lg border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#37476b]">
                  <Target className="h-6 w-6" />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{university.eligibilityCriteria}</p>
              </CardContent>
            </Card>
          </div>

          {/* YouTube Video Embed */}
          {embedUrl && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[#37476b]">Campus Tour</h3>
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-2xl shadow-xl"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="p-6 md:p-8 shadow-2xl border-none bg-white rounded-3xl">
              <CardHeader className="p-0 mb-6 space-y-1">
                <CardTitle className="text-2xl font-bold text-[#37476b]">Apply to this University</CardTitle>
                <p className="text-muted-foreground text-sm">Fill the form for a free consultation.</p>
              </CardHeader>
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={enquiryForm.name}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                  required
                  className="h-11 bg-muted/50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#37476b]"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                  required
                  className="h-11 bg-muted/50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#37476b]"
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                  required
                  className="h-11 bg-muted/50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#37476b]"
                />
                <Input
                  placeholder="City"
                  value={enquiryForm.city}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, city: e.target.value })}
                  required
                  className="h-11 bg-muted/50 border-gray-200 focus-visible:ring-1 focus-visible:ring-[#37476b]"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 bg-[#37476b] hover:bg-[#37476b]/90 text-white font-bold"
                  disabled={enquiryLoading}
                >
                  {enquiryLoading ? "Submitting..." : "Apply Now"}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  By clicking "Apply Now", you agree to our terms and privacy policy.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}