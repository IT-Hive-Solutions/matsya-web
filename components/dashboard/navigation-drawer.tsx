"use client";

import type React from "react";

import { directusEndpoints } from "@/core/contants/directusEndpoints";
import { AppDownloadLinkDirectus } from "@/core/interfaces/appDownloadLink.interface";
import { IUser } from "@/core/interfaces/user.interface";
import { getAssetURL, getDownloadUrl } from "@/core/lib/directus";
import { fetchHandler } from "@/core/services/apiHandler/fetchHandler";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Layers,
  Menu,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";

type Roles =
  | "admin"
  | "province-level"
  | "district-level"
  | "local-level"
  | "vaccinator";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section: string;
  requiredRoles: Roles[];
}

interface NavigationDrawerProps {
  onNavigate: (section: string) => void;
  currentSection: string;
  user: IUser;
}

export default function NavigationDrawer({
  onNavigate,
  currentSection,
  user,
}: NavigationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: "overview",
      label: "Dashboard",
      icon: <BarChart3 size={20} />,
      section: "overview",
      requiredRoles: [
        "admin",
        "province-level",
        "district-level",
        "local-level",
        "vaccinator",
      ],
    },
    {
      id: "new-entry",
      label: "New Entry",
      icon: <Plus size={20} />,
      section: "new-entry",
      requiredRoles: ["admin", "province-level", "local-level", "vaccinator"],
    },
    {
      id: "view-entries",
      label: "View Entries",
      icon: <Layers size={20} />,
      section: "view-entries",
      requiredRoles: [
        "admin",
        "province-level",
        "district-level",
        "local-level",
        "vaccinator",
      ],
    },
    // { id: "animals", label: "Manage Animals", icon: <Home size={20} />, section: "animals" },
    {
      id: "livestock-category",
      label: "Livestock Categories",
      icon: <Settings size={20} />,
      section: "livestock-category",
      requiredRoles: ["admin"],
    },
    {
      id: "livestock-type",
      label: "Livestock Types",
      icon: <Settings size={20} />,
      section: "livestock-type",
      requiredRoles: ["admin"],
    },
    {
      id: "user-accounts",
      label: "User Accounts",
      icon: <Users size={20} />,
      section: "user-accounts",
      requiredRoles: ["admin"],
    },
    {
      id: "offices",
      label: "Offices",
      icon: <Settings size={20} />,
      section: "offices",
      requiredRoles: ["admin"],
    },
    {
      id: "production-capacity",
      label: "Production Capacity",
      icon: <Settings size={20} />,
      section: "production-capacity",
      requiredRoles: ["admin"],
    },
  ];

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setIsOpen(false);
  };

  const { data: fetchedDownloadLinkData } = useQuery({
    queryKey: ["download-link"],
    queryFn: () =>
      fetchHandler<AppDownloadLinkDirectus>(
        directusEndpoints.app_download_link,
      ),
  });
  const handleDownloadApplication = async (fieldId: string) => {
    try {
      const url = getDownloadUrl(fieldId);

      // 1. Fetch the file data
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      // 2. Convert to a Blob (raw data)
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // 3. Create an invisible anchor tag to trigger the download
      const link = document.createElement("a");
      link.href = blobUrl;

      // You can dynamically set the filename here if you know it,
      // otherwise the browser will try to guess or use a default.
      link.download = "application-file";

      // 4. Append, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Add a toast notification here if you have one (e.g., toast.error("Download failed"))
    }
  };

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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <nav
        className={`fixed left-0 top-16 h-[90vh] w-max bg-card border-r border-border shadow-lg transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:top-0 lg:h-auto max-md:w-max  lg:w-[22vw] lg:border-r overflow-y-auto`}
      >
        <div className="h-max p-4 space-y-2">
          {/* Section Groups */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">
              Main
            </p>
            <div className="space-y-1">
              {navItems.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.section)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSection === item.section
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-secondary"
                  }
                  ${!item.requiredRoles.includes((user.role?.name ?? "") as Roles) && "hidden"}
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border my-2" />

          {/* Management Section */}
          {((user.role?.name ?? "") === "admin" ||
            (user.role?.name ?? "") === "province-level") && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">
                Management
              </p>
              <div className="space-y-1">
                {navItems.slice(3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.section)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentSection === item.section
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-secondary"
                    }  ${!item.requiredRoles.includes((user.role?.name ?? "") as Roles) && "hidden"}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr className="border-border my-2" />
          <div className="h-full flex flex-col justify-end py-4">
            {/* {fetchedDownloadLinkData?.data?.apk && ( */}
              <Link
                // href={getDownloadUrl(fetchedDownloadLinkData.data.apk)}
                href={'/app/app-release.apk'}
                target="_blank"
                className="w-full"
              >
                <Button
                  variant={"outline"}
                  className="w-full"
                  // onClick={() =>
                  //   handleDownloadApplication(fetchedDownloadLinkData?.data?.apk)
                  // }
                >
                  Download Mobile App
                </Button>
              </Link>
            {/* )} */}
          </div>
        </div>
      </nav>
    </>
  );
}
