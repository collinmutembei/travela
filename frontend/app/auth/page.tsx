"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { OtpInput } from "@/components/otp-input"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { getApiUrl, fetchFormApi } from "@/lib/api"
import { isValidKenyanPhone, formatPhoneNumber } from "@/lib/phone-utils"
import type { AuthResponse, OtpRequest, OtpVerification } from "@/types"

export default function AuthPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formattedPhone, setFormattedPhone] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/chat")
    } else {
      setIsCheckingAuth(false)
    }
  }, [router])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Format the phone number
    const formattedNumber = formatPhoneNumber(phoneNumber)

    // Validate the phone number
    if (!isValidKenyanPhone(formattedNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid Kenyan phone number (+254 followed by 9 digits)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Store the formatted phone for later use
    setFormattedPhone(formattedNumber)

    try {
      const requestData: OtpRequest = { phone: formattedNumber }

      const response = await fetch(getApiUrl("auth/request-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Failed to send OTP")
      }

      toast({
        title: "OTP Sent",
        description: "We've sent a verification code to your phone",
      })
      setShowOtpForm(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const formData: OtpVerification = {
        grant_type: "password",
        username: formattedPhone,
        password: otp,
      }

      const data = await fetchFormApi<AuthResponse>("auth/verify-otp", formData)
      localStorage.setItem("token", data.access_token || data.token_type)

      toast({
        title: "Success",
        description: "You have been successfully authenticated",
      })

      router.push("/chat")
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setShowOtpForm(false)
    setOtp("")
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Toaster />
      <Card className="w-[380px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{showOtpForm ? "Verification" : "Sign In"}</CardTitle>
          <CardDescription className="text-center">
            {showOtpForm ? "Enter the 6-digit code sent to your phone" : "Enter your phone number to continue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtpForm ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-secondary/50"
                  aria-label="Phone Number"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <OtpInput value={otp} onChange={setOtp} numInputs={6} />
              <Button onClick={handleVerifyOtp} className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {showOtpForm && (
            <Button variant="link" onClick={handleBack}>
              ← Back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
