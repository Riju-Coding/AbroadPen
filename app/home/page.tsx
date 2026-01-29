"use client"
import { slugify } from "@/lib/slugify"

import type React from "react"

import { useState, useEffect } from "react"
import { useEnquiryModal } from "@/components/enquiry-provider" // Import the hook
import Link from "next/link"
import { collection, getDocs, query, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { GraduationCap, ArrowRight, CheckCircle2, Globe2, Users, Sparkles, MessageSquare } from "lucide-react"
import type { Country, University } from "@/lib/types"

export default function PublicHomePage() {
  const [featuredCountries, setFeaturedCountries] = useState<Country[]>([])
  const [featuredUniversities, setFeaturedUniversities] = useState<University[]>([])
  const [allCountries, setAllCountries] = useState<Country[]>([]) // added state for all countries
  const [selectedCountryId, setSelectedCountryId] = useState<string>("all") // added state for university filtering
  const [loading, setLoading] = useState(true)
  const [enquiryLoading, setEnquiryLoading] = useState(false)
  const { toast } = useToast()
  const { openModal } = useEnquiryModal()
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  })

  const handleEnquirySubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setEnquiryLoading(true)
    try {
      const docRef = await addDoc(collection(db, "enquiries"), enquiryForm)
      console.log("Document written with ID: ", docRef.id)
      toast({
        title: "Enquiry Submitted",
        description: "Thank you for your interest. We will get back to you soon.",
      })
    } catch (error) {
      console.error("Error adding document: ", error)
      toast({
        title: "Error",
        description: "Failed to submit enquiry. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setEnquiryLoading(false)
    }
  }

  useEffect(() => {
    async function loadFeaturedData() {
      try {
        const countriesSnap = await getDocs(query(collection(db, "countries"))) // Fetch all countries for the network section
        const universitiesSnap = await getDocs(query(collection(db, "universities"))) // Fetch all universities for the tabbed listing

        const countries = countriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Country[]
        const universities = universitiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as University[]

        setAllCountries(countries)
        setFeaturedCountries(countries.slice(0, 6))
        setFeaturedUniversities(universities)
      } catch (error) {
        console.error("Failed to load featured data", error)
      } finally {
        setLoading(false)
      }
    }
    loadFeaturedData()
  }, [])

  const filteredUniversities =
    selectedCountryId === "all"
      ? featuredUniversities
      : featuredUniversities.filter((uni) => uni.countryId === selectedCountryId)

  return (
    <div className="flex flex-col w-full">
      <section className="relative bg-[#37476b] overflow-hidden px-4 md:px-8 pt-16 pb-20 md:pb-28">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Globe2 className="w-full h-full text-white" strokeWidth={0.1} />
        </div>

        <div className="max-w-7xl mx-auto z-10 w-full space-y-20">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 space-y-8 text-center lg:text-left text-white">
              <div className="inline-flex items-center gap-2 bg-[#f2c62f]/20 text-[#f2c62f] px-4 py-2 rounded-full font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                Empowering Global Dreams Since 2010
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.05]">
                Your Future <br />
                <span className="text-[#f2c62f]">Starts Here.</span>
              </h1>
              <div className="space-y-6">
                <p className="text-xl text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Join thousands of students who achieved their dreams of international education with our expert
                  guidance.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                  {featuredCountries.slice(0, 5).map((country) => (
                    <Link
                      key={country.id}
                      href={`/countries/${slugify(country.name)}`}
                      className="flex items-center gap-2 bg-white/10 hover:bg-[#f2c62f]/20 px-3 py-1.5 rounded-full border border-white/10 transition-all group"
                      title={country.name}
                    >
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                        {country.flagUrl ? (
                          <img
                            src={country.flagUrl || "/placeholder.svg"}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">{country.flag || "🌍"}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white group-hover:text-[#f2c62f] whitespace-nowrap">
                        {country.name}
                      </span>
                    </Link>
                  ))}
                  {featuredCountries.length > 5 && (
                    <Link
                      href="/countries"
                      className="flex items-center gap-1 text-xs font-bold text-[#f2c62f] hover:underline"
                    >
                      +{featuredCountries.length - 5} More
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <Button
                  onClick={openModal}
                  size="lg"
                  className="bg-[#f2c62f] text-[#37476b] hover:bg-[#f2c62f]/90 h-14 px-8 text-lg font-bold"
                >
                  Apply for 2024-25 Intake
                </Button>
                <Button
                  onClick={openModal}
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-bold border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  University Search
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8 shadow-2xl border-none bg-white/95 backdrop-blur-sm rounded-3xl">
                <CardHeader className="p-0 mb-6 space-y-1">
                  <CardTitle className="text-2xl font-bold text-[#37476b]">Get Expert Advice</CardTitle>
                  <p className="text-muted-foreground text-sm">Fill the form for a free consultation.</p>
                </CardHeader>
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="Full Name"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      required
                      className="h-11 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-[#37476b]"
                    />
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      required
                      className="h-11 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-[#37476b]"
                    />
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      required
                      className="h-11 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-[#37476b]"
                    />
                    <Input
                      placeholder="City"
                      value={enquiryForm.city}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, city: e.target.value })}
                      required
                      className="h-11 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-[#37476b]"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 bg-[#37476b] hover:bg-[#37476b]/90 text-white font-bold"
                    disabled={enquiryLoading}
                  >
                    {enquiryLoading ? "Submitting..." : "Send Request"}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">
                    By clicking "Send Request", you agree to our terms and privacy policy.
                  </p>
                </form>
              </Card>
            </div>
          </div>

          {/* Removing the large "Top Destinations" grid section to keep banner clean */}
          {/* <div className="space-y-10 pt-10 border-t border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-center sm:text-left space-y-1">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Top Destinations</h2>
                <p className="text-[#f2c62f] text-sm md:text-base font-semibold uppercase tracking-wider">
                  Explore global education hubs
                </p>
              </div>
              <Link href="/countries">
                <Button
                  variant="outline"
                  className="border-[#f2c62f]/50 text-[#f2c62f] hover:bg-[#f2c62f]/10 bg-transparent font-bold h-12 px-6 rounded-full transition-all"
                >
                  Explore All Countries <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
              {featuredCountries.map((country) => (
                <Link key={country.id} href={`/countries/${slugify(country.name)}`} className="group">
                  <div className="flex flex-col items-center gap-4 transition-all duration-300">
                    <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-[#f2c62f] group-hover:scale-105 transition-all duration-300 bg-white shadow-xl flex items-center justify-center">
                      {country.flagUrl ? (
                        <img
                          src={country.flagUrl || "/placeholder.svg"}
                          alt={country.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl md:text-4xl">{country.flag || "🌍"}</span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                    <h3 className="font-extrabold text-center text-white group-hover:text-[#f2c62f] transition-colors text-sm md:text-base tracking-wide uppercase">
                      {country.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div> */}
        </div>
      </section>

      <section className="bg-[#37476b]/5 py-24 border-b border-[#37476b]/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20">
          <div className="space-y-10 text-center lg:text-left text-[#37476b]">
            <div className="space-y-6">
              <h3 className="text-[#f2c62f] font-bold uppercase tracking-wider text-sm">Our Network</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allCountries.slice(0, 6).map((country) => (
                  <Link key={country.id} href={`/countries/${slugify(country.name)}`} className="group">
                    <div className="flex flex-col items-center gap-4 transition-all duration-300">
                      <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-[#f2c62f] group-hover:scale-105 transition-all duration-300 bg-white shadow-xl flex items-center justify-center">
                        {country.flagUrl ? (
                          <img
                            src={country.flagUrl || "/placeholder.svg"}
                            alt={country.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl md:text-4xl">{country.flag || "🌍"}</span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      </div>
                      <h3 className="font-extrabold text-center text-[#37476b] group-hover:text-[#f2c62f] transition-colors text-sm md:text-base tracking-wide uppercase">
                        {country.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-16 border-t border-[#37476b]/10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6">
                  <h2 className="text-4xl font-black tracking-tight text-[#37476b]">About Us</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    AbroadPen is a premier education consulting platform dedicated to helping students navigate the
                    complexities of international education. We bridge the gap between ambitious students and
                    world-class universities, providing end-to-end support for a seamless transition.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Our team of experts brings years of experience in global admissions, visa processing, and student
                    mentorship, ensuring that every student finds their perfect academic fit.
                  </p>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
                  <img src="/about-us-team.jpg" alt="About AbroadPen" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="pt-16 border-t border-[#37476b]/10">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-12">
                <div className="lg:max-w-2xl space-y-4">
                  <h2 className="text-4xl font-black tracking-tight text-[#37476b]">Why Choose AbroadPen?</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    We provide comprehensive support for your international education journey, from initial counselling
                    to post-arrival assistance.
                  </p>
                </div>
                <Button 
                onClick={openModal}
                className="bg-[#37476b] text-white hover:bg-[#37476b]/90 h-14 px-8 rounded-full font-bold">
                  Learn Our Story
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Expert Counselling",
                    desc: "One-on-one sessions to find your perfect fit.",
                    icon: MessageSquare,
                    color: "bg-blue-50 text-blue-600",
                  },
                  {
                    title: "Admission Support",
                    desc: "Hassle-free application and documentation.",
                    icon: GraduationCap,
                    color: "bg-yellow-50 text-yellow-600",
                  },
                  {
                    title: "Visa Guidance",
                    desc: "High success rate in global visa approvals.",
                    icon: Globe2,
                    color: "bg-green-50 text-green-600",
                  },
                  {
                    title: "Career Placement",
                    desc: "Global career opportunities after study.",
                    icon: Users,
                    color: "bg-purple-50 text-purple-600",
                  },
                ].map((service, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-[#37476b]/5 hover:shadow-md transition-shadow group"
                  >
                    <div className={`w-14 h-14 ${service.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <service.icon className="h-7 w-7" />
                    </div>
                    <h5 className="font-bold text-xl text-[#37476b] mb-2">{service.title}</h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* University Listing Preview */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl font-bold tracking-tight">Top Universities</h2>
            <p className="text-muted-foreground text-lg">Explore globally recognized medical & research institutions</p>
          </div>
          <div className="flex flex-wrap gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCountryId("all")}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                selectedCountryId === "all"
                  ? "bg-[#37476b] text-white"
                  : "bg-white text-[#37476b] border border-[#37476b]/10 hover:bg-[#37476b]/5"
              }`}
            >
              All Universities
            </button>
            {allCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountryId(country.id)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedCountryId === country.id
                    ? "bg-[#37476b] text-white"
                    : "bg-white text-[#37476b] border border-[#37476b]/10 hover:bg-[#37476b]/5"
                }`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredUniversities.slice(0, 8).map((uni) => (
            <Link key={uni.id} href={`/universities/${slugify(uni.name)}`} className="group">
              <div className="bg-white rounded-[2rem] p-6 shadow-md border border-[#37476b]/5 hover:shadow-2xl transition-all duration-300 h-full flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#37476b]/5 mb-6 bg-white flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={uni.logoUrl || "/placeholder.svg?height=160&width=160&query=university logo"}
                    alt={uni.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-black text-lg text-[#37476b] line-clamp-2 leading-tight group-hover:text-[#f2c62f] transition-colors">
                  {uni.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About & Services Preview */}
      <section className="bg-muted/30 py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Expert Guidance for Your Global Journey</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AbroadPen is not just a consulting firm; we are your partners in education. With a network of global
                universities and a team of seasoned counsellors, we simplify the complex process of international
                admissions.
              </p>
              <ul className="space-y-4">
                {[
                  "Personalized University Shortlisting",
                  "Step-by-Step Documentation Assistance",
                  "Pre-departure Orientation",
                  "Post-arrival Support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="link" className="px-0 text-primary font-bold text-lg">
                Read Our Story <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-background p-8 rounded-3xl shadow-sm border border-border">
                  <MessageSquare className="h-10 w-10 text-primary mb-4" />
                  <h5 className="font-bold text-xl">Counselling</h5>
                  <p className="text-sm text-muted-foreground">One-on-one sessions to find your perfect fit.</p>
                </div>
                <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-xl">
                  <GraduationCap className="h-10 w-10 mb-4" />
                  <h5 className="font-bold text-xl">Admission</h5>
                  <p className="text-sm text-primary-foreground/80">Hassle-free application and documentation.</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-background p-8 rounded-3xl shadow-sm border border-border">
                  <Globe2 className="h-10 w-10 text-primary mb-4" />
                  <h5 className="font-bold text-xl">Visa Help</h5>
                  <p className="text-sm text-muted-foreground">99% success rate in visa approvals.</p>
                </div>
                <div className="bg-background p-8 rounded-3xl shadow-sm border border-border">
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <h5 className="font-bold text-xl">Placement</h5>
                  <p className="text-sm text-muted-foreground">Global career opportunities after study.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-primary rounded-[3rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Ready to Start Your <br className="hidden md:block" /> International Education Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Book a free 30-minute consultation with our senior counsellors today. No strings attached!
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Button 
             onClick={openModal}
            size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold">
              Book Appointment Now
            </Button>
            <Button
              onClick={openModal}
              size="lg"
              variant="outline"
              className="h-14 px-10 text-lg font-bold border-white text-white hover:bg-white hover:text-primary bg-transparent"
            >
              Download Brochure
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

// function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
//   return (
//     <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider", className)}>
//       {children}
//     </span>
//   )
// }
