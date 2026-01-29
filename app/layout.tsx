import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { EnquiryModalProvider } from "@/components/enquiry-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AbroadPen - Education Consulting Platform",
  description: "Manage universities, leads, and applications for international education consulting",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* 1. Added suppressHydrationWarning here */}
      <body 
        className={`font-sans antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <EnquiryModalProvider>
            
            {/* 2. Wrapped Navbar in a suppression div to handle the Radix ID error */}
            <div suppressHydrationWarning={true}>
              <Navbar />
            </div>

            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </EnquiryModalProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}