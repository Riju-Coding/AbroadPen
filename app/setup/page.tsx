"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, Loader2 } from "lucide-react"

export default function SetupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)

  const currentUser = auth.currentUser

  useEffect(() => {
    const checkUserRole = async () => {
      if (!currentUser?.email) {
        setCheckingRole(false)
        return
      }

      console.log("[v0] Checking user role for email:", currentUser.email)

      try {
        const usersRef = collection(db, "users")
        const q = query(usersRef, where("email", "==", currentUser.email), where("role", "==", "consultant"))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          console.log("[v0] Email found as consultant in users collection, redirecting to consultant register")
          // If consultant exists, redirect to consultant registration instead
          router.push("/auth/consultant-register")
        } else {
          console.log("[v0] Email not found as consultant, proceeding with admin setup")
        }
      } catch (err) {
        console.error("[v0] Error checking user role:", err)
      } finally {
        setCheckingRole(false)
      }
    }

    checkUserRole()
  }, [currentUser, router])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      setError("No user is currently logged in")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create user document in Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email,
        role: "super_admin",
        name: name || currentUser.email?.split("@")[0] || "Admin",
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/admin")
        router.refresh()
      }, 2000)
    } catch (err: any) {
      console.error("Setup error:", err)
      setError(err.message || "Failed to set up admin account")
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <CardTitle>Admin Setup Required</CardTitle>
            <CardDescription>Please log in first to set up your admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/auth/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
            <p className="text-sm text-muted-foreground">Verifying account type...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <CardTitle>Admin Account Setup</CardTitle>
          <CardDescription>Complete your Super Admin profile to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="mb-4 border-green-500 text-green-700">
              <AlertDescription>Admin account created successfully! Redirecting to dashboard...</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={currentUser?.email || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" type="text" value="Super Admin" disabled />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
