"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, X } from "lucide-react"

const PROVINCES = ["Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpaschim"]

const DISTRICTS: { [key: string]: string[] } = {
  Bagmati: ["Kathmandu", "Bhaktapur", "Lalitpur"],
  Gandaki: ["Pokhara", "Kaski", "Lamjung"],
  Lumbini: ["Butwal", "Palpa", "Nawalparasi"],
  Karnali: ["Nepalgunj", "Surkhet", "Jumla"],
  Sudurpaschim: ["Dhangadhi", "Dadeldhura", "Baitadi"],
}

const MUNICIPALITIES: { [key: string]: { [key: string]: string[] } } = {
  Bagmati: {
    Kathmandu: ["Kathmandu Metropolitan City", "Budhanilkantha", "Kageshwori Manohara"],
    Bhaktapur: ["Bhaktapur Municipality", "Changunarayan"],
    Lalitpur: ["Lalitpur Metropolitan City", "Godavari"],
  },
  Gandaki: {
    Pokhara: ["Pokhara Metropolitan City"],
    Kaski: ["Kaski Municipality"],
    Lamjung: ["Besisahar Municipality"],
  },
  Lumbini: {
    Butwal: ["Butwal Sub-Metropolitan City"],
    Palpa: ["Tansen Municipality"],
    Nawalparasi: ["Kawasoti Municipality"],
  },
  Karnali: {
    Nepalgunj: ["Nepalgunj Sub-Metropolitan City"],
    Surkhet: ["Birendranagar Municipality"],
    Jumla: ["Khalanga Municipality"],
  },
  Sudurpaschim: {
    Dhangadhi: ["Dhangadhi Sub-Metropolitan City"],
    Dadeldhura: ["Dadeldhura Municipality"],
    Baitadi: ["Baitadi Municipality"],
  },
}

const USER_TYPES = [
  { value: "vaccinator", label: "Vaccinator" },
  { value: "local-officer", label: "Local Level Officer" },
  { value: "district-officer", label: "District Level Officer" },
  { value: "province-officer", label: "Province Level Officer" },
  { value: "admin", label: "Administrator" },
]

interface UserFormProps {
  onClose: () => void
  onSubmit: (user: any) => void
  offices: any[]
}

export default function UserForm({ onClose, onSubmit, offices }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    userType: "",
    office: "",
    province: "",
    district: "",
    municipality: "",
    wardNumber: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.includes("@")) newErrors.email = "Valid email is required"

    const phoneRegex = /^(98|01)\d{8,10}$/
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Invalid phone format"
    }

    if (!formData.userType) newErrors.userType = "User type is required"
    if (!formData.office) newErrors.office = "Office is required"
    if (!formData.province) newErrors.province = "Province is required"
    if (!formData.district) newErrors.district = "District is required"
    if (!formData.municipality) newErrors.municipality = "Municipality is required"
    if (!formData.wardNumber || Number.parseInt(formData.wardNumber) < 1) {
      newErrors.wardNumber = "Valid ward number required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    onSubmit({
      id: Math.random().toString(),
      ...formData,
      wardNumber: Number.parseInt(formData.wardNumber),
    })
  }

  const handleProvinceChange = (value: string) => {
    setFormData({
      ...formData,
      province: value,
      district: "",
      municipality: "",
    })
  }

  const handleDistrictChange = (value: string) => {
    setFormData({
      ...formData,
      district: value,
      municipality: "",
    })
  }

  return (
    <Card className="shadow-xl">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Create User Account</h3>
            <p className="text-sm text-muted-foreground mt-1">Add a new user to the system</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Close">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Full Name</label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+977</span>
                <Input
                  type="tel"
                  placeholder="98XXXXXXXXX"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                  className={`pl-12 ${errors.phoneNumber ? "border-destructive" : ""}`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* User Type */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">User Type</label>
              <Select
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value })}
              >
                <SelectTrigger className={errors.userType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  {USER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userType && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.userType}
                </p>
              )}
            </div>

            {/* Office */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Assigned Office</label>
              <Select value={formData.office} onValueChange={(value) => setFormData({ ...formData, office: value })}>
                <SelectTrigger className={errors.office ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select office" />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((office) => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.office && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.office}
                </p>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
            <h4 className="text-sm font-semibold text-foreground mb-4">Location Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Province */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Province</label>
                <Select value={formData.province} onValueChange={handleProvinceChange}>
                  <SelectTrigger className={errors.province ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.province && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.province}
                  </p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">District</label>
                <Select value={formData.district} onValueChange={handleDistrictChange} disabled={!formData.province}>
                  <SelectTrigger className={errors.district ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.province &&
                      DISTRICTS[formData.province]?.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.district && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.district}
                  </p>
                )}
              </div>

              {/* Municipality */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Municipality/Rural Area</label>
                <Select
                  value={formData.municipality}
                  onValueChange={(value) => setFormData({ ...formData, municipality: value })}
                  disabled={!formData.district}
                >
                  <SelectTrigger className={errors.municipality ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.district &&
                      MUNICIPALITIES[formData.province]?.[formData.district]?.map((mun) => (
                        <SelectItem key={mun} value={mun}>
                          {mun}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.municipality && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.municipality}
                  </p>
                )}
              </div>

              {/* Ward Number */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Ward Number</label>
                <Input
                  type="number"
                  placeholder="1-32"
                  min="1"
                  max="32"
                  value={formData.wardNumber}
                  onChange={(e) => setFormData({ ...formData, wardNumber: e.target.value })}
                  className={errors.wardNumber ? "border-destructive" : ""}
                />
                {errors.wardNumber && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.wardNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              Create User
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
