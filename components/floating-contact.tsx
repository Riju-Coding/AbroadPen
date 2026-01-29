"use client"

import React from "react"
import { Phone, MessageCircle, FileText, Send } from "lucide-react"
import { useEnquiryModal } from "@/components/enquiry-provider"
import { Button } from "@/components/ui/button"

export function FloatingContact() {
  const { openModal } = useEnquiryModal()
  const phoneNumber = "+917827262135"
  const whatsappUrl = `https://wa.me/917827262135?text=Hi,%20I'm%20interested%20in%20studying%20abroad.`

  return (
    <>
      {/* =========================================
          DESKTOP VIEW: Sticky Vertical Stack (Bottom Right)
          Hidden on mobile (md:flex)
      ========================================= */}
      <div className="hidden md:flex flex-col gap-4 fixed bottom-8 right-8 z-[90] items-end">
        
        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
        >
          <span className="bg-white text-[#25D366] px-3 py-1 rounded-md shadow-md text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Chat on WhatsApp
          </span>
          <div className="bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center w-14 h-14">
            <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={1.5} />
          </div>
        </a>

        {/* Phone Call */}
        <a
          href={`tel:${phoneNumber}`}
          className="group flex items-center gap-2"
        >
          <span className="bg-white text-[#37476b] px-3 py-1 rounded-md shadow-md text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Call Us
          </span>
          <div className="bg-[#37476b] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center w-14 h-14">
            <Phone className="h-6 w-6" />
          </div>
        </a>

        {/* Enquiry Form (Pulsing Effect) */}
        <button
          onClick={openModal}
          className="group flex items-center gap-2"
        >
          <span className="bg-white text-[#f2c62f] px-3 py-1 rounded-md shadow-md text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Book Enquiry
          </span>
          <div className="relative">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f2c62f] opacity-75"></span>
            <div className="relative bg-[#f2c62f] text-[#37476b] p-3 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center justify-center w-14 h-14 border-2 border-white">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </button>
      </div>

      {/* =========================================
          MOBILE VIEW: Bottom Sticky App Bar
          Hidden on desktop (md:hidden)
      ========================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] pb-safe">
        <div className="grid grid-cols-3 h-16">
          
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 active:bg-gray-50 transition-colors border-r border-gray-100"
          >
            <MessageCircle className="h-5 w-5 text-[#25D366]" fill="currentColor" />
            <span className="text-[10px] font-bold text-gray-600">WhatsApp</span>
          </a>

          {/* Enquiry (Center - Highlighted) */}
          <button
            onClick={openModal}
            className="flex flex-col items-center justify-center gap-1 bg-[#37476b] text-white relative -top-4 rounded-t-xl shadow-lg mx-2"
          >
            <div className="bg-[#f2c62f] p-2 rounded-full text-[#37476b] shadow-sm">
               <FileText className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold">Enquire</span>
          </button>

          {/* Call */}
          <a
            href={`tel:${phoneNumber}`}
            className="flex flex-col items-center justify-center gap-1 active:bg-gray-50 transition-colors border-l border-gray-100"
          >
            <Phone className="h-5 w-5 text-[#37476b]" />
            <span className="text-[10px] font-bold text-gray-600">Call Now</span>
          </a>
        </div>
        
        {/* Safe area spacer for iPhone home bar */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white w-full" />
      </div>
    </>
  )
}