"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type EnquiryModalContextType = {
  openModal: () => void
  closeModal: () => void
}

const EnquiryModalContext = createContext<EnquiryModalContextType | undefined>(undefined)

export function useEnquiryModal() {
  const context = useContext(EnquiryModalContext)
  if (!context) {
    throw new Error("useEnquiryModal must be used within an EnquiryModalProvider")
  }
  return context
}

export function EnquiryModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  })

  useEffect(() => {
    // REMOVED SESSION STORAGE CHECK
    // This will now trigger on every page reload after 2 seconds
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, "enquiries"), formData)
      toast({
        title: "Enquiry Submitted",
        description: "We will get back to you shortly!",
      })
      setFormData({ name: "", email: "", phone: "", city: "" })
      closeModal()
    } catch (error) {
      console.error("Error adding document: ", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <EnquiryModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all" 
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 z-[110]">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 bg-[#f2c62f]/20 text-[#f2c62f] px-3 py-1 rounded-full font-semibold text-xs">
                    <Sparkles className="h-3 w-3" />
                    Free Consultation
                </div>
                <h2 className="text-2xl font-bold text-[#37476b]">Get Expert Advice</h2>
                <p className="text-muted-foreground text-sm">
                  Fill the form below and our counselors will contact you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-11 bg-muted/30"
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11 bg-muted/30"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="h-11 bg-muted/30"
                  />
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="h-11 bg-muted/30"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 bg-[#37476b] hover:bg-[#37476b]/90 text-white font-bold"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Book Free Session"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </EnquiryModalContext.Provider>
  )
}