"use client"

import { Card } from "@/components/ui/card"

interface User {
  id: string
  userType: string
  province: string
}

interface OverviewProps {
  user: User
}

export default function DashboardOverview({ user }: OverviewProps) {
  const stats = [
    { label: "Total Animals Tagged", value: "1,247", change: "+12% this month", icon: "🐄" },
    { label: "Total Vaccinated", value: "856", change: "+8% this month", icon: "💉" },
    { label: "Pending Entries", value: "23", change: "Needs review", icon: "⏳" },
    { label: "Recent Entries", value: "142", change: "Last 7 days", icon: "📋" },
  ]

  return (
    <div className="space-y-6">
      {/* Role-based Welcome */}
      <div className="rounded-lg border border-border bg-secondary/50 p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">
          You're logged in as a <span className="font-semibold text-foreground">{user.userType.replace("-", " ")}</span>{" "}
          in {user.province} province
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl">{stat.icon}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-accent/10 text-accent">{stat.change}</span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mb-1">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">Cattle tag #{1000 + item} registered</p>
                <p className="text-xs text-muted-foreground">{item * 2} hours ago</p>
              </div>
              <span className="text-lg">✓</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
