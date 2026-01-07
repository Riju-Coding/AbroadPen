"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image" // Import Next.js Image
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Phone, Instagram, Facebook, Twitter, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { slugify } from "@/lib/slugify"

interface Country {
  id: string
  name: string
}

const navItemStyles = "text-[#37476b] hover:text-primary transition-colors font-bold"

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [countries, setCountries] = React.useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = React.useState(true)

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const q = query(collection(db, "countries"), orderBy("name"))
        const snapshot = await getDocs(q)
        const countriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }))
        setCountries(countriesData)
      } catch (error) {
        console.error("Firebase Error:", error)
      } finally {
        setLoadingCountries(false)
      }
    }
    fetchCountries()
  }, [])

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/setup")) {
    return null
  }

  return (
    <div className="flex flex-col w-full sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#f2c62f] text-[#37476b] py-2 px-4 md:px-8 flex justify-between items-center text-xs md:text-sm font-bold">
        <div className="flex items-center gap-4">
          <span className="bg-[#37476b] text-white px-2 py-0.5 rounded text-[10px]">LIVE</span>
          <span className="hidden sm:inline">Connect with our experts now!</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>+91 98765 43210</span>
          </div>
          <div className="hidden md:flex gap-3">
            <Link href="#"><Instagram className="h-4 w-4" /></Link>
            <Link href="#"><Facebook className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>

      <header className="bg-white/95 backdrop-blur-md border-b border-border px-4 md:px-8 h-20 flex items-center justify-between">
        {/* LOGO SECTION - Updated to use logo.png */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"       // Path to your public/logo.png
            alt="AbroadPen Logo"
            width={180}           // Adjust width as needed
            height={50}           // Adjust height as needed
            className="h-50 w-50 object-contain" // Force height to fit header
            priority             // Loads the logo immediately
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/" className={cn(navigationMenuTriggerStyle(), navItemStyles)}>
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={navItemStyles}>Countries</NavigationMenuTrigger>
                <NavigationMenuContent className="min-h-[100px]">
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white border border-slate-200 shadow-xl rounded-lg">
                    {loadingCountries ? (
                      <li className="col-span-2 p-10 text-center text-[#37476b] font-medium">Loading...</li>
                    ) : countries.length > 0 ? (
                      <>
                        {countries.map((country) => (
                          <ListItem
                            key={country.id}
                            title={country.name}
                            href={`/countries/${slugify(country.name)}`}
                          />
                        ))}
                        <ListItem
                          title="All Countries"
                          href="/countries"
                          className="bg-slate-50 font-bold border-t mt-2"
                        />
                      </>
                    ) : (
                      <li className="col-span-2 text-center py-4">No countries available</li>
                    )}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/universities" className={cn(navigationMenuTriggerStyle(), navItemStyles)}>
                    Universities
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/about" className={cn(navigationMenuTriggerStyle(), navItemStyles)}>
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-bold text-[#37476b]">Login</Button>
            </Link>
            <Link href="/enquire">
              <Button className="font-bold bg-[#37476b] text-white hover:bg-[#37476b]/90 px-6">Apply Now</Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-white">
            <nav className="flex flex-col gap-6 mt-10">
              <Link href="/" onClick={() => setIsOpen(false)} className="text-xl font-bold text-[#37476b]">Home</Link>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Countries</span>
                {countries.map((country) => (
                  <Link
                    key={country.id}
                    href={`/countries/${slugify(country.name)}`}
                    onClick={() => setIsOpen(false)}
                    className="pl-4 py-2 border-l-2 border-slate-100 text-[#37476b]"
                  >
                    {country.name}
                  </Link>
                ))}
              </div>
              <div className="pt-6 border-t flex flex-col gap-3">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/enquire" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#37476b] text-white">Apply Now</Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </header>
    </div>
  )
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a"> & { title: string }>(
  ({ className, title, children, href, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            href={href || "#"}
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100",
              className
            )}
            {...props}
          >
            <div className="text-sm font-bold leading-none text-[#37476b]">{title}</div>
            {children && <p className="line-clamp-2 text-sm leading-snug text-slate-500">{children}</p>}
          </Link>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"