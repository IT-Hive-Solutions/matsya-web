"use client";

import { directusEndpoints } from "@/core/contants/directusEndpoints";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { IUser } from "@/core/interfaces/user.interface";
import {
  fetchHandler
} from "@/core/services/apiHandler/fetchHandler";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Loading from "../loading";
import AnalyticsDashboard from "../view/DashboardView";
import DashboardCharts from "./dashboard-charts";
import DashboardContent from "./dashboard-content";
import DashboardHeader from "./dashboard-header";
import ManagementPage from "./management-pages";
import NavigationDrawer from "./navigation-drawer";

interface DashboardProps {
  user: IUser;
}

export default function Dashboard({ user }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: fetchedAnimalList, isLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: () =>
      fetchHandler<IAnimal[]>(directusEndpoints.animal_info, { fields: "*.*" }),
  });

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <AnalyticsDashboard
            animals={(fetchedAnimalList?.data as IAnimal[]) ?? []}
          />
        );
      case "new-entry":
        return (
          <DashboardContent
            user={user}
            activeTab="new-entry"
            setActiveTab={setActiveTab}
          />
        );
      case "view-entries":
        return (
          <DashboardContent
            user={user}
            activeTab="view-entries"
            setActiveTab={setActiveTab}
          />
        );
      case "analytics":
        return <DashboardCharts />;
      case "livestock":
        return <ManagementPage type="livestock" />;
      case "livestock-category":
        return <ManagementPage type="livestock-category" />;
      case "livestock-type":
        return <ManagementPage type="livestock-type" />;
      case "user-accounts":
        return <ManagementPage type="user-accounts" />;
      case "offices":
        return <ManagementPage type="offices" />;
      case "production-capacity":
        return <ManagementPage type="production-capacity" />;
      default:
        return (
          <DashboardContent
            user={user}
            activeTab="overview"
            setActiveTab={() => {}}
          />
        );
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader user={user} />
      <div className="flex flex-1 overflow-hidden">
        <NavigationDrawer
          onNavigate={setActiveTab}
          currentSection={activeTab}
          user={user}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  ">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
