"use client"

import type React from "react"
import { doc, getDoc } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [checkingRole, setCheckingRole] = useState(false)

  useEffect(() => {
    async function handleRouting() {
      if (!loading && !checkingRole) {
        if (!user) {
          router.push("/auth/login")
        } else if (user && !userData) {
          setCheckingRole(true)
          try {
            // First check if user document with this uid exists
            const userDocRef = doc(db, "users", user.uid)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
              // Document exists but userData is not loaded yet, wait for auth context to update
              console.log("[v0] User document exists, waiting for auth context to load")
              return
            }

            // No document with uid exists, check if email is registered as consultant
            console.log("[v0] No user document found, checking if email is pre-registered")
            const usersRef = collection(db, "users")
            const q = query(usersRef, where("email", "==", user.email), where("role", "==", "consultant"))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
              console.log("[v0] Email found as consultant, redirecting to consultant register")
              router.push("/auth/consultant-register")
            } else {
              console.log("[v0] Email not found as consultant, redirecting to admin setup")
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userData={userData} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userData={userData} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
