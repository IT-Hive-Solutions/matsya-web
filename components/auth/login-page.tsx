"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface LoginPageProps {
  onLogin: (user: any) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Phone number validation (Nepal format: 98XXXXXXXXX or 01XXXXXXXX)
    const phoneRegex = /^(98|01)\d{8,10}$/
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Enter valid phone number (98XXXXXXXXX or 01XXXXXXXX)"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newUser = {
      id: Math.random().toString(),
      phoneNumber: formData.phoneNumber,
      userType: "vaccinator", // Default - would come from backend
    }

    setIsLoading(false)
    onLogin(newUser)
  }

  return (
    <main className="min-h-screen  from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl  from-primary to-primary/80 mb-4 shadow-lg">
            <span className="text-4xl">🐄</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Matsya</h1>
          <p className="text-muted-foreground text-sm">Livestock Tagging & Vaccination System</p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-border/50">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in with your phone number and password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Number */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    +977
                  </span>
                  <Input
                    type="tel"
                    placeholder="98XXXXXXXXX"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "")
                      setFormData({ ...formData, phoneNumber: cleaned })
                    }}
                    className={`pl-12 ${errors.phoneNumber ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.phoneNumber && (
                  <div className="flex items-center gap-2 text-xs text-destructive mt-2">
                    <AlertCircle size={14} />
                    {errors.phoneNumber}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={errors.password ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.password && (
                  <div className="flex items-center gap-2 text-xs text-destructive mt-2">
                    <AlertCircle size={14} />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 mt-6 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Contact your administrator if you don't have credentials
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">Protected by secure authentication</p>
      </div>
    </main>
  )
}
