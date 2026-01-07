"use client"

import type React from "react"

import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Phone, Mail, Clock } from "lucide-react"

export default function EnquirePage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await addDoc(collection(db, "enquiries"), {
        ...form,
        type: "standalone_enquiry",
        createdAt: new Date(),
        status: "new",
      })

      toast({
        title: "Message Received!",
        description: "We'll get back to you within 24 business hours.",
      })
      setForm({ name: "", email: "", phone: "", city: "", message: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary py-24 px-4 md:px-8 text-white text-center">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Contact Our Experts</h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Have questions? We're here to help you navigate your study abroad journey.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 pb-24 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Card className="shadow-2xl border-none p-8 md:p-12">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-3xl font-bold">Send us a Message</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    placeholder="Full Name"
                    className="h-12"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="h-12"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    className="h-12"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Your City"
                    className="h-12"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Tell us about your study plans..."
                  className="min-h-[150px] p-4"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold" disabled={loading}>
                {loading ? "Sending..." : "Submit Enquiry"}
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-primary/5 border-none p-8">
            <h3 className="text-xl font-bold mb-6">Contact Details</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold">Call Us</p>
                  <p className="text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold">Email Us</p>
                  <p className="text-muted-foreground">info@abroadpen.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <p className="font-bold">Working Hours</p>
                  <p className="text-muted-foreground">Mon - Sat: 9 AM - 6 PM</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-primary text-primary-foreground p-8 rounded-3xl">
            <MessageSquare className="h-12 w-12 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Live Chat</h3>
            <p className="text-primary-foreground/80 mb-6">
              Need immediate help? Chat with our experts on WhatsApp for instant guidance.
            </p>
            <Button variant="secondary" className="w-full font-bold">
              Chat on WhatsApp
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
