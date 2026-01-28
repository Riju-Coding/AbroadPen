"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [checkingRole, setCheckingRole] = useState(false)
  
  // State for managing the mobile sidebar visibility
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  // Your existing useEffect for routing remains the same
  useEffect(() => {
    async function handleRouting() {
      if (!loading && !checkingRole) {
        if (!user) {
          router.push("/auth/login")
        } else if (user && !userData) {
          setCheckingRole(true)
          try {
            const userDocRef = doc(db, "users", user.uid)
            const userDoc = await getDoc(userDocRef)
            if (userDoc.exists()) {
              return
            }
            const usersRef = collection(db, "users")
            const q = query(usersRef, where("email", "==", user.email), where("role", "==", "consultant"))
            const querySnapshot = await getDocs(q)
            if (!querySnapshot.empty) {
              router.push("/auth/consultant-register")
            } else {
              router.push("/setup")
            }
          } catch (err) {
            console.error("[v0] Error checking user role:", err)
            router.push("/setup")
          } finally {
            setCheckingRole(false)
          }
        }
      }
    }
    handleRouting()
  }, [user, userData, loading, router, checkingRole])

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  return (
    <>
      {/* This overlay will cover the main content when the sidebar is open on mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}
      
      <div className="flex h-screen bg-background">
        <Sidebar userData={userData} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userData={userData} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </>
  )
}