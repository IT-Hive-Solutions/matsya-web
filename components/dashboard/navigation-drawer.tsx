"use client"

import type React from "react"

import { useState } from "react"
import { Menu, X, Plus, Settings, BarChart3, Users, Home, Layers } from "lucide-react"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  section: string
}

interface NavigationDrawerProps {
  onNavigate: (section: string) => void
  currentSection: string
}

export default function NavigationDrawer({ onNavigate, currentSection }: NavigationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems: NavItem[] = [
    { id: "overview", label: "Dashboard", icon: <BarChart3 size={20} />, section: "overview" },
    { id: "new-entry", label: "New Entry", icon: <Plus size={20} />, section: "new-entry" },
    { id: "view-entries", label: "View Entries", icon: <Layers size={20} />, section: "view-entries" },
    { id: "animals", label: "Manage Animals", icon: <Home size={20} />, section: "animals" },
    { id: "cattle-category", label: "Cattle Categories", icon: <Settings size={20} />, section: "cattle-category" },
    { id: "user-accounts", label: "User Accounts", icon: <Users size={20} />, section: "user-accounts" },
    { id: "offices", label: "Create Office", icon: <Settings size={20} />, section: "offices" },
  ]

  const handleNavigate = (section: string) => {
    onNavigate(section)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Drawer */}
      <nav
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border shadow-lg transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:top-0 lg:h-auto lg:w-64 lg:border-r overflow-y-auto`}
      >
        <div className="p-4 space-y-2">
          {/* Section Groups */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Main</p>
            <div className="space-y-1">
              {navItems.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.section)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSection === item.section ? "bg-primary text-white" : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border my-2" />

          {/* Management Section */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Management</p>
            <div className="space-y-1">
              {navItems.slice(3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.section)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSection === item.section ? "bg-primary text-white" : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
