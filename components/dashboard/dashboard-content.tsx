"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardOverview from "./dashboard-overview";
import TaggingForm from "./tagging-form";
import ViewEntriesPage from "./view-entries";
import { IUser } from "@/core/interfaces/user.interface";
import AnimalLists from "../view/AnimalLists";

interface DashboardContentProps {
  user: IUser;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardContent({
  user,
  activeTab,
  setActiveTab,
}: DashboardContentProps) {
  if (!["overview", "new-entry", "view-entries"].includes(activeTab)) {
    return null;
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger
            value="overview"
            className="text-xs sm:text-sm hover:cursor-pointer hover:bg-primary/20 transition-all"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="new-entry"
            className="text-xs sm:text-sm hover:cursor-pointer hover:bg-primary/20 transition-all"
          >
            New Entry
          </TabsTrigger>
          <TabsTrigger
            value="view-entries"
            className="text-xs sm:text-sm hover:cursor-pointer hover:bg-primary/20 transition-all"
          >
            View Entries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DashboardOverview user={user} />
        </TabsContent>

        <TabsContent value="new-entry" className="mt-6">
          <TaggingForm user={user} />
        </TabsContent>

        <TabsContent value="view-entries" className="mt-6">
          <ViewEntriesPage user={user} setActiveTab={setActiveTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
