"use client"

import type React from "react"

import { use, useState, useEffect } from "react"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { slugify } from "@/lib/slugify"
import type { University } from "@/lib/types"

export default function UniversityDetailsPage({ params }: { params: any }) {
  const resolvedParams = params instanceof Promise ? use(params) : params
  const slug = resolvedParams?.slug

  const [university, setUniversity] = useState<University | null>(null)
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
    async function fetchUniversity() {
      if (!slug) return
      try {
        const universitiesSnap = await getDocs(collection(db, "universities"))
        const foundUniversity = universitiesSnap.docs.find((doc) => slugify(doc.data().name) === slug)

        if (foundUniversity) {
          setUniversity({ id: foundUniversity.id, ...foundUniversity.data() } as University)
        }
      } catch (error) {
        console.error("Error fetching university:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUniversity()
  }, [slug])

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
        description: `Your interest in ${university?.name} has been recorded.`,
      })
      setEnquiryForm({ name: "", email: "", phone: "", city: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit enquiry.",
        variant: "destructive",
      })
    } finally {
      setEnquiryLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!university) return <div className="min-h-screen flex items-center justify-center">University not found.</div>

  const totalFee = university.feesStructure
    ? Object.values(university.feesStructure).reduce(
        (sum, year) => sum + year.tuitionFees + year.hostelFees + year.messCharges + year.otherCharges,
        0,
      )
    : 0

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Banner / Header */}

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid lg:grid-cols-3 gap-12">
        {/* Main Content */}

        {/* Sidebar / Form */}
      </div>
    </div>
  )
}
