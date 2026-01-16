"use client"

import { useState } from "react"
import DashboardHeader from "./dashboard-header"
import NavigationDrawer from "./navigation-drawer"
import DashboardContent from "./dashboard-content"
import DashboardCharts from "./dashboard-charts"
import ManagementPage from "./management-pages"

interface User {
  id: string
  name: string
  email: string
  userType: string
  province: string
  district: string
  wardNumber: number
}

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardContent user={user} activeTab="overview" setActiveTab={setActiveTab} />
      case "new-entry":
        return <DashboardContent user={user} activeTab="new-entry" setActiveTab={setActiveTab} />
      case "view-entries":
        return <DashboardContent user={user} activeTab="view-entries" setActiveTab={setActiveTab} />
      case "analytics":
        return <DashboardCharts />
      case "animals":
        return <ManagementPage type="animals" />
      case "cattle-category":
        return <ManagementPage type="cattle-category" />
      case "user-accounts":
        return <ManagementPage type="user-accounts" />
      case "offices":
        return <ManagementPage type="offices" />
      default:
        return <DashboardContent user={user} activeTab="overview" setActiveTab={() => {}} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader user={user} onLogout={onLogout} />
      <div className="flex flex-1 overflow-hidden">
        <NavigationDrawer onNavigate={setActiveTab} currentSection={activeTab} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
