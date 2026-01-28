"use client"

import { useState } from "react"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Send } from "lucide-react"

export default function ContactPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill all required fields.", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await addDoc(collection(db, "contactSubmissions"), {
        ...form,
        submittedAt: new Date(),
      })
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We will get back to you soon.",
      })
      setForm({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      console.error("Error submitting contact form: ", error)
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const contactDetails = [
    { icon: Phone, text: "+91 7827262135", href: "tel:+917827262135" },
    { icon: Mail, text: "admission@abroadpen.com", href: "mailto:admission@abroadpen.com" }, // Corrected .con to .com
  ]

  const addresses = [
    {
      name: "New Delhi Office",
      details: "3rd Floor ALT F, Near Sarita Bihar Metro Station, New Delhi, India",
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.654311029415!2d77.2954622753835!3d28.55013347571167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce407d8315a63%3A0x2354c3789448825!2sSarita%20Vihar%20Metro%20Station!5e0!3m2!1sen!2sin!4v1675862143715!5m2!1sen!2sin",
    },
    {
      name: "Faridabad Office",
      details: "J-Block, Sector 10, Faridabad, Haryana, India - 121006",
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3508.814322436154!2d77.30796337537877!3d28.42501697577964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cdd7e7b8f9e7b%3A0xb35a5103b41a37ad!2sSector%2010%2C%20Faridabad%2C%20Haryana%20121006!5e0!3m2!1sen!2sin!4v1675862215432!5m2!1sen!2sin",
    },
  ]

  return (
    <div className="bg-gray-50/50">
      {/* Header */}
      <section className="bg-[#37476b] text-white py-16 md:py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-8 z-10 relative">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Contact Us</h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Reach out and let us help you start your global journey.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-5 gap-16">
          {/* Left Side: Contact Info */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-[#37476b]">Get in Touch</h2>
              <p className="text-muted-foreground">
                Our team is ready to provide you with expert guidance and answer any questions you might have.
              </p>
            </div>
            <div className="space-y-6">
              {contactDetails.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center gap-4 group text-lg font-medium text-foreground hover:text-[#37476b] transition-colors"
                >
                  <div className="bg-[#37476b]/10 text-[#37476b] p-3 rounded-full group-hover:bg-[#f2c62f]/20 group-hover:text-[#f2c62f] transition-all">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span>{item.text}</span>
                </a>
              ))}
            </div>
            <div className="space-y-8">
              {addresses.map((addr) => (
                <div key={addr.name} className="flex items-start gap-4">
                  <div className="bg-[#37476b]/10 text-[#37476b] p-3 rounded-full mt-1">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{addr.name}</h3>
                    <p className="text-muted-foreground">{addr.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-3">
            <Card className="p-8 shadow-2xl border-none bg-white rounded-3xl">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-bold text-[#37476b]">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input name="name" placeholder="Full Name" value={form.name} onChange={handleInputChange} required />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input name="phone" type="tel" placeholder="Phone Number" value={form.phone} onChange={handleInputChange} />
                    <Input name="subject" placeholder="Subject" value={form.subject} onChange={handleInputChange} />
                  </div>
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    rows={6}
                    value={form.message}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 bg-[#37476b] hover:bg-[#37476b]/90 text-white font-bold"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                    {!loading && <Send className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Maps Section */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-8">
          {addresses.map((addr) => (
            <div key={addr.name} className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <iframe
                src={addr.mapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}