"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
// Import the Menu icon
import { LogOut, User, Menu } from "lucide-react"

interface HeaderProps {
  userData: {
    name: string
    email: string
    role: "super_admin" | "consultant"
  }
  // Add the toggleSidebar function to the props
  toggleSidebar: () => void
}

export function Header({ userData, toggleSidebar }: HeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut(auth)
    router.push("/auth/login")
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* --- THIS IS THE NEW PART --- */}
        {/* Mobile menu button, hidden on medium screens and up */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        {/* --- END OF NEW PART --- */}

        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          {userData.role === "super_admin" ? "Super Admin" : "Consultant"}
        </span>
      </div>

      {/* This DropdownMenu section remains exactly as you had it */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userData.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}