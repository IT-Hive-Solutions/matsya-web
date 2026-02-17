"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const vaccinationData = [
  { month: "Jan", vaccinated: 240, tagged: 320 },
  { month: "Feb", vaccinated: 221, tagged: 300 },
  { month: "Mar", vaccinated: 229, tagged: 290 },
  { month: "Apr", vaccinated: 200, tagged: 270 },
  { month: "May", vaccinated: 290, tagged: 350 },
  { month: "Jun", vaccinated: 250, tagged: 320 },
]

const animalTypeData = [
  { name: "Livestock", value: 45, color: "#10b981" },
  { name: "Goats", value: 25, color: "#3b82f6" },
  { name: "Sheep", value: 20, color: "#f59e0b" },
  { name: "Buffaloes", value: 10, color: "#ef4444" },
]

const districtData = [
  { name: "Kathmandu", value: 320 },
  { name: "Bhaktapur", value: 280 },
  { name: "Lalitpur", value: 240 },
  { name: "Pokhara", value: 190 },
  { name: "Biratnagar", value: 150 },
]

export default function DashboardCharts() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics & Visualizations</h2>

      {/* Vaccination & Tagging Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Vaccination & Tagging Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={vaccinationData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f3f4f6",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="vaccinated" stroke="#10b981" strokeWidth={2} name="Vaccinated" />
            <Line type="monotone" dataKey="tagged" stroke="#3b82f6" strokeWidth={2} name="Tagged" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Animal Type Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Animal Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={animalTypeData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
                {animalTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {animalTypeData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* District-wise Coverage */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">District-wise Coverage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={districtData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                }}
              />
              <Bar dataKey="value" fill="#10b981" name="Entries" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}
