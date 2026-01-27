"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IUser } from "@/core/interfaces/user.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { endpoints } from "@/core/contants/endpoints";
import { animalColumns } from "../view/AnimalLists";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { IAnimal } from "@/core/interfaces/animal.interface";
import Loading from "../loading";
import { useQuery } from "@tanstack/react-query";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

interface Entry {
  id: string;
  tagNumber: string;
  ownerName: string;
  animalType: string;
  district: string;
  date: string;
  status: "completed" | "pending" | "review";
}

interface ViewEntriesPageProps {
  user: IUser;
  setActiveTab: (tab: string) => void;
}

export default function ViewEntriesPage({ user, setActiveTab }: ViewEntriesPageProps) {
  const [animalLists, setAnimalLists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState(
    user.office_id.district_id.district_name ?? "",
  );
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      completed: "bg-accent/10 text-accent",
      pending: "bg-yellow-100 text-yellow-700",
      review: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const { data: fetchedAnimalList, isLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_info),
  });
  useEffect(() => {
    if (fetchedAnimalList?.data) {
      setAnimalLists(fetchedAnimalList?.data);
    }
  }, [fetchedAnimalList]);
  console.log({ animalLists });

  const animalTable = useCustomReactPaginatedTable<IAnimal, any>({
    data: animalLists,
    columns: animalColumns,
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {/* <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Search by Tag or Owner
            </label>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              District
            </label>
            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={user.office_id.district_id.district_name ?? ""}
                >
                  {user.office_id.district_id.district_name ?? ""}
                </SelectItem>
                <SelectItem value="Bhaktapur">Bhaktapur</SelectItem>
                <SelectItem value="Lalitpur">Lalitpur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Status
            </label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card> */}

      {/* Entries List */}
      <div className="space-y-3">
        {animalLists?.length > 0 ? (
          <DataTableWithPagination table={animalTable} />
        ) : (
          <Card className="p-12 text-center border-border/50">
            <p className="text-muted-foreground mb-4 text-sm">
              No entries created yet! Create your first Entry
            </p>
            <Button
              onClick={() => setActiveTab("new-entry")}
              variant="outline"
              className="gap-2 hover:cursor-pointer"
            >
              <Plus size={18} />
              Create Now
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
