"use client"

import { useState } from "react"
import LoginPage from "@/components/auth/login-page"
import Dashboard from "@/components/dashboard/dashboard"
import { ToastProvider } from "@/components/ui/toast"

type UserType = "vaccinator" | "local-level" | "district-level" | "province-level"

interface User {
  id: string
  name: string
  email: string
  userType: UserType
  province: string
  district: string
  wardNumber: number
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (loginUser: User) => {
    setUser(loginUser)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <ToastProvider>
      {isAuthenticated && user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </ToastProvider>
  )
}
