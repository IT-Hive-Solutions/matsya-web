"use client";

import { useState } from "react";
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
}

export default function ViewEntriesPage({ user }: ViewEntriesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState(
    user.office_id.district_id.district_name ?? "",
  );
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data
  const allEntries: Entry[] = [
    {
      id: "1",
      tagNumber: "TAG-001-2024",
      ownerName: "Ram Kumar",
      animalType: "Cow",
      district: user.office_id.district_id.district_name ?? "",
      date: "2024-12-20",
      status: "completed",
    },
    {
      id: "2",
      tagNumber: "TAG-002-2024",
      ownerName: "Sita Sharma",
      animalType: "Buffalo",
      district: user.office_id.district_id.district_name ?? "",
      date: "2024-12-19",
      status: "completed",
    },
    {
      id: "3",
      tagNumber: "TAG-003-2024",
      ownerName: "Hari Prasad",
      animalType: "Goat",
      district: user.office_id.district_id.district_name ?? "",
      date: "2024-12-18",
      status: "pending",
    },
    {
      id: "4",
      tagNumber: "TAG-004-2024",
      ownerName: "Gita Devi",
      animalType: "Cow",
      district: "Bhaktapur",
      date: "2024-12-17",
      status: "review",
    },
  ];

  const filteredEntries = allEntries.filter((entry) => {
    const matchesSearch =
      entry.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict =
      !filterDistrict || entry.district === filterDistrict;
    const matchesStatus =
      filterStatus === "all" || entry.status === filterStatus;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 sm:p-6">
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
      </Card>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredEntries.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="hidden sm:block">
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Tag Number
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Animal Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-secondary/50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          {entry.tagNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {entry.ownerName}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {entry.animalType}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString("en-NP")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(entry.status)}`}
                          >
                            {getStatusLabel(entry.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden space-y-3">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {entry.tagNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.ownerName}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(entry.status)}`}
                    >
                      {getStatusLabel(entry.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium text-foreground">
                        {entry.animalType}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(entry.date).toLocaleDateString("en-NP")}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No entries found</p>
          </Card>
        )}
      </div>

      {/* Summary */}
      <Card className="p-4 sm:p-6 bg-secondary/50">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredEntries.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {allEntries.length}
          </span>{" "}
          entries
        </p>
      </Card>
    </div>
  );
}
