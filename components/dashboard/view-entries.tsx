"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/core/contants/endpoints";
import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { IUser } from "@/core/interfaces/user.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { updateProtectedHandler } from "@/core/services/apiHandler/mutateHandler";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCheckIcon,
  CheckCircleIcon,
  ChevronRight,
  Edit2,
  Layers,
  LucideOctagonMinus,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Loading from "../loading";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { Button } from "../ui/button";
import AnimalForm from "./animal-form";

interface ViewEntriesPageProps {
  user: IUser;
  setActiveTab: (tab: string) => void;
}

interface GroupedAnimal {
  owner: {
    id: number;
    name: string;
    contact: string;
    localLevel: string;
    ward: string;
    district: number;
  };
  animals: IAnimal[];
}

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { bg: string; text: string; label: string }> =
    {
      pending: {
        bg: "bg-amber-500/10",
        text: "text-amber-700",
        label: "Pending",
      },
      verified: {
        bg: "bg-blue-500/10",
        text: "text-blue-700",
        label: "Verified",
      },
      validated: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-700",
        label: "Validated",
      },
      rejected: {
        bg: "bg-red-500/10",
        text: "text-red-700",
        label: "Rejected",
      },
    };

  const variant = variants[status] || variants.pending;

  return (
    <Badge
      variant="secondary"
      className={`${variant.bg} ${variant.text} border-0 font-medium text-xs px-2.5 py-0.5`}
    >
      {variant.label}
    </Badge>
  );
};

export default function OwnerAnimalView({
  user,
  setActiveTab,
}: ViewEntriesPageProps) {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<GroupedAnimal | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateVerificationStatusMutation = useMutation({
    mutationFn: (payload: {
      id: number;
      verification_status: VerificationStatus;
    }) =>
      updateProtectedHandler(
        endpoints.animal_info.update_animal_status(payload.id),
        { verification_status: payload.verification_status },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["animals"],
      });
      toast.success("Status updated successfully!");
    },
    onError: () => {
      toast.error("Error updating status!");
    },
  });

  const { data: fetchedAnimalList, isLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_info),
  });

  const groupedData: GroupedAnimal[] = (() => {
    if (!fetchedAnimalList?.data) return [];

    const grouped = fetchedAnimalList.data.reduce(
      (acc: Record<number, GroupedAnimal>, animal: IAnimal) => {
        const ownerId = animal.owners_id.id;

        if (!acc[ownerId]) {
          acc[ownerId] = {
            owner: {
              id: animal.owners_id.id,
              name: animal.owners_id.owners_name,
              contact: animal.owners_id.owners_contact,
              localLevel: animal.owners_id.local_level_name,
              ward: animal.owners_id.ward_number,
              district: animal.owners_id.district_id,
            },
            animals: [],
          };
        }

        acc[ownerId].animals.push(animal);
        return acc;
      },
      {},
    );

    return Object.values(grouped);
  })();

  const filteredData = groupedData.filter(
    (group) =>
      group.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.owner.contact.includes(searchTerm) ||
      group.animals.some((animal) =>
        animal.tag_number.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50/50">
      {/* Header Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Livestock Registry
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Manage and verify animal ownership records
                </p>
              </div>
              {selectedOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOwner(null)}
                  className="gap-2 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                  Clear Selection
                </Button>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="p-4 border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <User className="h-4 w-4 text-slate-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {filteredData.length}
                    </p>
                    <p className="text-xs text-slate-600">Total Owners</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Activity className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {filteredData.reduce(
                        (sum, group) => sum + group.animals.length,
                        0,
                      )}
                    </p>
                    <p className="text-xs text-slate-600">Total Animals</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircleIcon className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {filteredData.reduce(
                        (sum, group) =>
                          sum +
                          group.animals.filter(
                            (a) => a.verification_status === "verified",
                          ).length,
                        0,
                      )}
                    </p>
                    <p className="text-xs text-slate-600">Verified</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {filteredData.reduce(
                        (sum, group) =>
                          sum +
                          group.animals.filter(
                            (a) => a.verification_status === "pending",
                          ).length,
                        0,
                      )}
                    </p>
                    <p className="text-xs text-slate-600">Pending</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 h-[calc(100vh-280px)]">
          {/* Owner List - Left Side */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              selectedOwner ? "w-full md:w-96 lg:w-105 shrink-0" : "w-full"
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by owner name, contact, or tag number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white border-slate-200 focus-visible:ring-slate-900"
                  />
                </div>
              </div>

              {/* Owner Cards List */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {filteredData.length > 0 ? (
                  <div
                    className={`grid gap-4 ${selectedOwner ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
                  >
                    {filteredData.map((group) => (
                      <Card
                        key={group.owner.id}
                        className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ${
                          selectedOwner?.owner.id === group.owner.id
                            ? " bg-slate-50 shadow-md "
                            : "border-slate-200 bg-white hover:shadow-lg hover:scale-[1.02] hover:border-slate-300"
                        }`}
                        onClick={() => setSelectedOwner(group)}
                      >
                        {/* Selected indicator stripe */}
                        {selectedOwner?.owner.id === group.owner.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
                        )}

                        {/* Decorative gradient background */}
                        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-transparent to-transparent opacity-60" />

                        <div className="relative p-5">
                          {/* Owner Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                                  selectedOwner?.owner.id === group.owner.id
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                                }`}
                              >
                                <User className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3
                                  className={`font-semibold text-base leading-tight truncate ${
                                    selectedOwner?.owner.id === group.owner.id
                                      ? "text-slate-900"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {group.owner.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  ID: {group.owner.id}
                                </p>
                              </div>
                            </div>
                            {selectedOwner?.owner.id !== group.owner.id && (
                              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition-all shrink-0" />
                            )}
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="font-medium truncate">
                                {group.owner.contact}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {group.owner.localLevel}, Ward{" "}
                                {group.owner.ward}
                              </span>
                            </div>
                          </div>

                          {/* Animal Count & Status */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <div className="p-1 bg-emerald-100 rounded">
                                <Layers className="h-3 w-3 text-emerald-700" />
                              </div>
                              <span className="text-xs font-semibold text-slate-900">
                                {group.animals.length} Animal
                                {group.animals.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* Status indicators */}
                            <div className="flex gap-1">
                              {group.animals.filter(
                                (a) => a.verification_status === "validated",
                              ).length > 0 && (
                                <div className="flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  <CheckCheckIcon className="h-2.5 w-2.5 text-emerald-600" />
                                  <span className="text-xs font-medium text-emerald-700">
                                    {
                                      group.animals.filter(
                                        (a) =>
                                          a.verification_status === "validated",
                                      ).length
                                    }
                                  </span>
                                </div>
                              )}
                              {group.animals.filter(
                                (a) => a.verification_status === "pending",
                              ).length > 0 && (
                                <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
                                  <AlertCircle className="h-2.5 w-2.5 text-amber-600" />
                                  <span className="text-xs font-medium text-amber-700">
                                    {
                                      group.animals.filter(
                                        (a) =>
                                          a.verification_status === "pending",
                                      ).length
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center border-slate-200 bg-white">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-100 rounded-full">
                        <User className="h-8 w-8 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-900 mb-1">
                          No owners found
                        </p>
                        <p className="text-sm text-slate-600">
                          {searchTerm
                            ? "Try adjusting your search terms"
                            : "Start by creating your first entry"}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Animal Details - Right Side */}
          {selectedOwner && (
            <div className="hidden md:flex flex-1 flex-col min-w-0 animate-in slide-in-from-right duration-500">
              {/* Owner Info Header */}
              <Card className="p-5 border-slate-200 bg-white mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 rounded-xl shrink-0">
                    <User className="h-5 w-5 text-slate-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-slate-900 truncate">
                      {selectedOwner.owner.name}'s Animals
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Phone className="h-3 w-3" />
                        {selectedOwner.owner.contact}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="h-3 w-3" />
                        {selectedOwner.owner.localLevel}, Ward{" "}
                        {selectedOwner.owner.ward}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 border-0 shrink-0"
                  >
                    {selectedOwner.animals.length} Animals
                  </Badge>
                </div>
              </Card>

              {/* Animal Cards Grid */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {selectedOwner.animals.map((animal, index) => (
                    <Card
                      key={animal.id}
                      className="group relative overflow-hidden border-slate-200 bg-white hover:shadow-lg transition-all duration-300"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {/* Status indicator stripe */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          animal.verification_status === "validated"
                            ? "bg-emerald-500"
                            : animal.verification_status === "verified"
                              ? "bg-blue-500"
                              : animal.verification_status === "rejected"
                                ? "bg-red-500"
                                : "bg-amber-500"
                        }`}
                      />

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-slate-900 truncate">
                                {animal.animal_type.animal_name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="bg-slate-100 text-slate-700 border-0 text-xs shrink-0"
                              >
                                {animal.animal_category.category_name}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 font-mono">
                              Tag: {animal.tag_number}
                            </p>
                          </div>

                          {/* Actions Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-slate-100 shrink-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditDialogOpen(true);
                                  setSelectedAnimal(animal.id);
                                }}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>

                              <AlertDialogWrapper
                                title="Verify Animal"
                                description="This animal record will be marked as verified. Continue?"
                                onConfirm={async (setOpen) => {
                                  await handleUpdateVerificationStatusMutation.mutateAsync(
                                    {
                                      id: animal.id,
                                      verification_status:
                                        VerificationStatus.Verified,
                                    },
                                  );
                                  setOpen && setOpen(false);
                                }}
                              >
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 cursor-pointer"
                                >
                                  <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                                  <span>Mark as Verified</span>
                                </DropdownMenuItem>
                              </AlertDialogWrapper>

                              <AlertDialogWrapper
                                title="Validate Animal"
                                description="This animal record will be marked as validated. Continue?"
                                onConfirm={async (setOpen) => {
                                  await handleUpdateVerificationStatusMutation.mutateAsync(
                                    {
                                      id: animal.id,
                                      verification_status:
                                        VerificationStatus.Validated,
                                    },
                                  );
                                  setOpen && setOpen(false);
                                }}
                              >
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 cursor-pointer"
                                >
                                  <CheckCheckIcon className="h-4 w-4 text-emerald-600" />
                                  <span>Mark as Validated</span>
                                </DropdownMenuItem>
                              </AlertDialogWrapper>

                              <AlertDialogWrapper
                                title="Reject Animal"
                                description="This animal record will be marked as rejected. Continue?"
                                onConfirm={async (setOpen) => {
                                  await handleUpdateVerificationStatusMutation.mutateAsync(
                                    {
                                      id: animal.id,
                                      verification_status:
                                        VerificationStatus.Rejected,
                                    },
                                  );
                                  setOpen && setOpen(false);
                                }}
                              >
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <LucideOctagonMinus className="h-4 w-4" />
                                  <span>Reject Record</span>
                                </DropdownMenuItem>
                              </AlertDialogWrapper>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              Age
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <p className="text-sm font-medium text-slate-900">
                                {animal.age_months}, {animal.age_years}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              Production
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Activity className="h-3 w-3 text-slate-400" />
                              <p className="text-sm font-medium text-slate-900">
                                {animal.production_capacity || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              Vaccination
                            </p>
                            <Badge
                              variant="secondary"
                              className={`${
                                !(animal.is_vaccination_applied == "no")
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              } border-0 text-xs px-2 py-0.5`}
                            >
                              {!(animal.is_vaccination_applied == "no")
                                ? "Applied"
                                : "Not Applied"}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              Status
                            </p>
                            <StatusBadge status={animal.verification_status} />
                          </div>
                        </div>

                        {/* Location */}
                        {animal.latitude && animal.longitude && (
                          <div className="pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span className="font-mono">
                                {animal.latitude}, {animal.longitude}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Timestamps */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                          <span>
                            Created:{" "}
                            {new Date(animal.date_created).toLocaleDateString()}
                          </span>
                          <span>
                            Updated:{" "}
                            {new Date(
                              String(animal.date_updated),
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && selectedAnimal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <AnimalForm
            onClose={() => setEditDialogOpen(false)}
            animalId={selectedAnimal}
          />
        </div>
      )}
    </div>
  );
}
