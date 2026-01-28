"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube, GraduationCap } from "lucide-react"

export function Footer() {
  const pathname = usePathname()

  // Hide footer on admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/setup")) {
    return null
  }

  return (
    <footer className="bg-[#37476b] pt-20 pb-10 border-t border-white/10 mt-auto text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#f2c62f] p-2 rounded-lg">
              <span className="text-[#37476b] font-black text-xl italic">AP</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-[#f2c62f]">AbroadPen</span>
          </Link>
          <p className="text-white/70 leading-relaxed font-medium">
            Leading study abroad consultant dedicated to helping students achieve their international education dreams.
            Trusted by thousands of students globally.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="p-2 bg-white/10 rounded-full hover:bg-[#f2c62f] hover:text-[#37476b] transition-all border border-white/10 shadow-sm"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="p-2 bg-white/10 rounded-full hover:bg-[#f2c62f] hover:text-[#37476b] transition-all border border-white/10 shadow-sm"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="p-2 bg-white/10 rounded-full hover:bg-[#f2c62f] hover:text-[#37476b] transition-all border border-white/10 shadow-sm"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="p-2 bg-white/10 rounded-full hover:bg-[#f2c62f] hover:text-[#37476b] transition-all border border-white/10 shadow-sm"
            >
              <Youtube className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-[#f2c62f]">Quick Links</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/" className="text-white/70 hover:text-[#f2c62f] transition-colors font-medium">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-white/70 hover:text-[#f2c62f] transition-colors font-medium">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/countries" className="text-white/70 hover:text-[#f2c62f] transition-colors font-medium">
                Browse Countries
              </Link>
            </li>
            <li>
              <Link href="/universities" className="text-white/70 hover:text-[#f2c62f] transition-colors font-medium">
                University List
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-white/70 hover:text-[#f2c62f] transition-colors font-medium">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-[#f2c62f]">Our Services</h4>
          <ul className="space-y-4 font-medium">
            <li className="flex items-center gap-2 text-white/70">
              <GraduationCap className="h-4 w-4 text-[#f2c62f]" />
              Free Counselling
            </li>
            <li className="flex items-center gap-2 text-white/70">
              <GraduationCap className="h-4 w-4 text-[#f2c62f]" />
              University Selection
            </li>
            <li className="flex items-center gap-2 text-white/70">
              <GraduationCap className="h-4 w-4 text-[#f2c62f]" />
              Admission Support
            </li>
            <li className="flex items-center gap-2 text-white/70">
              <GraduationCap className="h-4 w-4 text-[#f2c62f]" />
              Visa Guidance
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-bold mb-6 text-[#f2c62f]">Contact Us</h4>
          <ul className="space-y-4 font-medium">
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#f2c62f] shrink-0" />
              <a href="tel:+917827262135" className="text-white/70 hover:text-[#f2c62f] transition-colors">
                +91 7827262135
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#f2c62f] shrink-0" />
              <a href="mailto:admission@abroadpen.com" className="text-white/70 hover:text-[#f2c62f] transition-colors">
                admission@abroadpen.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#f2c62f] shrink-0 mt-1" />
              <span className="text-white/70">
                3rd Floor ALT F, Near Sarita Bihar Metro Station, New Delhi, India
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#f2c62f] shrink-0 mt-1" />
              <span className="text-white/70">J-Block, Sector 10, Faridabad, Haryana, India - 121006</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
        <p>© {new Date().getFullYear()} AbroadPen. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-[#f2c62f] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-and-conditions" className="hover:text-[#f2c62f] transition-colors">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  )
}