"use client";

import { Button } from "@/components/ui/button";
import { IUser } from "@/core/interfaces/user.interface";

interface HeaderProps {
  user: IUser;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: HeaderProps) {
  const getUserTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      vaccinator: "Vaccinator",
      "local-level": "Local Level Officer",
      "district-level": "District Level Officer",
      "province-level": "Province Level Officer",
    };
    return labels[type] || type;
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <span className="text-lg">🐄</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Matsya
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Livestock Management
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {user.full_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {getUserTypeLabel(user.user_type)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-xs sm:text-sm bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
