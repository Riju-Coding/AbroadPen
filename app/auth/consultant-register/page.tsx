"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ConsultantRegisterPage() {
  const [step, setStep] = useState<"verify" | "register">("verify")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [consultantDoc, setConsultantDoc] = useState<{ id: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if email exists in consultants collection
      const q = query(
        collection(db, "users"),
        where("email", "==", email),
        where("role", "==", "consultant"),
        where("registered", "==", false),
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        toast({
          title: "Error",
          description: "Email not found or already registered. Please contact your administrator.",
          variant: "destructive",
        })
        return
      }

      const consultantData = snapshot.docs[0]
      setConsultantDoc({ id: consultantData.id, name: consultantData.data().name })
      setStep("register")
      toast({
        title: "Success",
        description: "Email verified! Please set your password.",
      })
    } catch (error: any) {
      console.error("Error verifying email:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to verify email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update consultant document with uid and registered flag
      if (consultantDoc) {
        const consultantRef = doc(db, "users", consultantDoc.id)
        await updateDoc(consultantRef, {
          uid: userCredential.user.uid,
          registered: true,
        })
      }

      toast({
        title: "Success",
        description: "Account created successfully! You can now login.",
      })

      // Redirect to login page
      setTimeout(() => {
        router.push("/auth/login")
      }, 1500)
    } catch (error: any) {
      console.error("Error creating account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle className="text-2xl font-bold">Consultant Registration</CardTitle>
              <CardDescription>Complete your account setup</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {step === "verify" ? (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">Enter the email provided by your administrator</p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>Welcome, {consultantDoc?.name}!</Label>
                <p className="text-sm text-muted-foreground">Set a password to complete your registration</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Complete Registration"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
