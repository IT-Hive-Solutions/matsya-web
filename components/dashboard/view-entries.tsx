"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/core/contants/endpoints";
import { getMonthLabel } from "@/core/enums/month.enum";
import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { IUser } from "@/core/interfaces/user.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { updateProtectedHandler } from "@/core/services/apiHandler/mutateHandler";
import { useEscapeKey } from "@/hooks/useEscapePress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCheckIcon,
  CheckCircleIcon,
  ChevronRight,
  Edit2,
  Eye,
  Layers,
  LucideOctagonMinus,
  MapPin,
  MapPinnedIcon,
  Phone,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import Loading from "../loading";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { Button } from "../ui/button";
import AnimalForm from "./animal-form";
import EntryRejectionWithReason from "./rejectEntryModal";
import AnimalDetail from "./animal-detail";

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

export const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { bg: string; text: string; label: string }> =
    {
      pending: {
        bg: "bg-amber-500/10",
        text: "text-amber-700",
        label: "Accepted",
      },
      draft: {
        bg: "bg-purple-500/10",
        text: "text-purple-700",
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
  const [isViewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<GroupedAnimal | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEscapeKey(() => {
    setSelectedOwner(null);
  });

  const handleUpdateVerificationStatusMutation = useMutation({
    mutationFn: (payload: {
      id: number;
      verification_status: VerificationStatus;
      reason?: string;
    }) =>
      updateProtectedHandler(
        endpoints.animal_info.update_animal_status(payload.id),
        {
          verification_status: payload.verification_status,
          rejection_reason: payload.reason,
        },
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
        const ownerId = animal.owners_id?.id;

        if (!acc[ownerId]) {
          acc[ownerId] = {
            owner: {
              id: animal.owners_id?.id,
              name: animal.owners_id?.owners_name,
              contact: animal.owners_id?.owners_contact,
              localLevel: animal.owners_id?.local_level_name,
              ward: animal.owners_id?.ward_number,
              district: animal.owners_id?.district_id,
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
      group.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.owner?.contact?.includes(searchTerm) ||
      group.animals?.some((animal) =>
        animal.tag_number.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50/50">
      <div className="   ">
        <div className="flex gap-6 h-[calc(100vh-20vh)]">
          {/* Owner List - Left Side */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              selectedOwner
                ? "max-md:hidden sm:w-24 md:w-48 lg:w-72 shrink-0"
                : "w-full"
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by owner name, contact, or tag number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white border-slate-200 focus-visible:ring-slate-900"
                  />
                </div>
              </div>

              {/* Owner Cards List */}
              <div
                className={" overflow-y-auto pr-2 space-y-3 custom-scrollbar"}
              >
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

                        <div className="relative px-5">
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
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-slate-700 group-hover:translate-x-1 transition-all shrink-0" />
                            )}
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="font-medium truncate">
                                {group.owner.contact}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="truncate">
                                {group.owner.localLevel}, Ward{" "}
                                {group.owner.ward}
                              </span>
                            </div>
                            <div>
                              <Link
                                target="_blank"
                                href={`https://www.google.com/maps/search/${group.animals[0].latitude},+${group.animals[0].longitude}`}
                                className="flex gap-2"
                              >
                                <MapPinnedIcon className="text-muted-foreground w-4 h-4" />
                                <span className="truncate text-xs text-muted-foreground underline">
                                  Locate in Map
                                </span>
                              </Link>
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
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-900 mb-1">
                          No owners found
                        </p>
                        <p className="text-sm text-muted-foreground">
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
            <div className="h-full  md:flex flex-1 flex-col min-w-0 animate-in slide-in-from-right duration-500">
              <Button
                variant={"ghost"}
                className="w-max hover:cursor-pointer flex items-center justify start mb-4 md:hidden "
                onClick={() => setSelectedOwner(null)}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Go Back to Owner</span>
              </Button>
              {/* Animal Cards Grid */}
              <div className=" flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {selectedOwner.animals.map((animal, index) => (
                    <Card
                      key={animal.id}
                      className="group relative overflow-hidden border-slate-200 bg-white hover:shadow-lg transition-all duration-300 pb-2"
                      style={{
                        animationDelay: `${index * 30}ms`,
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
                                : animal.verification_status === "pending"
                                  ? "bg-amber-900"
                                  : "bg-amber-500"
                        }`}
                      />

                      <div className="px-5 pt-2">
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
                            <p className="text-xs text-muted-foreground font-mono">
                              Tag: {animal.tag_number}
                            </p>
                          </div>
                          {(animal.verification_status ===
                            VerificationStatus.Rejected ||
                            animal.verification_status ===
                              VerificationStatus.Draft) &&
                            user.role.name === "vaccinator" && (
                              <Button
                                variant={"ghost"}
                                onClick={() => {
                                  setEditDialogOpen(true);
                                  setSelectedAnimal(animal.id);
                                }}
                                className="gap-2 cursor-pointer"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                          <Button
                            variant={"ghost"}
                            onClick={() => {
                              setViewDialogOpen(true);
                              setSelectedAnimal(animal.id);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              Age
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <p className="text-sm font-medium text-slate-900">
                                {animal.age_years} Years and
                                {animal.age_months} Months
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">
                              Production
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Activity className="h-3 w-3 text-muted-foreground" />
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
                                  : "bg-slate-100 text-muted-foreground"
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
                        <div className="w-full flex items-start justify-between  py-2 border-t border-slate-200">
                          {animal.verification_status ===
                            VerificationStatus.Verified &&
                            (user.role.name === "admin" ||
                              user.role.name === "province-level") && (
                              <AlertDialogWrapper
                                className="w-max"
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
                                <div
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 cursor-pointer border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
                                >
                                  <CheckCheckIcon className="h-4 w-4 text-emerald-600" />
                                  <span>Validate</span>
                                </div>
                              </AlertDialogWrapper>
                            )}
                          {animal.verification_status ===
                            VerificationStatus.Pending &&
                            (user.role.name === "district-level" ||
                              user.role.name === "admin") && (
                              <AlertDialogWrapper
                                className="w-max"
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
                                <div
                                  onSelect={(e) => e.preventDefault()}
                                  className="flex item-center gap-2 cursor-pointer border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
                                >
                                  <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                                  <span>Verify</span>
                                </div>
                              </AlertDialogWrapper>
                            )}
                          {!(
                            animal.verification_status ===
                              VerificationStatus.Validated ||
                            animal.verification_status ===
                              VerificationStatus.Rejected
                          ) &&
                            (user.role.name === "admin" ||
                              user.role.name === "province-level" ||
                              user.role.name === "local-level") && (
                              <EntryRejectionWithReason
                                className="w-max"
                                title="Reject Animal?"
                                description="This animal record will be marked as rejected. Continue?"
                                onConfirm={async (setOpen, reason) => {
                                  await handleUpdateVerificationStatusMutation.mutateAsync(
                                    {
                                      id: animal.id,
                                      verification_status:
                                        VerificationStatus.Rejected,
                                      reason,
                                    },
                                  );
                                  setOpen && setOpen(false);
                                }}
                              >
                                <Button
                                  variant={"outline"}
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 cursor-pointer text-red-600 focus:text-white hover:text-white"
                                >
                                  <LucideOctagonMinus className="h-4 w-4" />
                                  <span>Reject</span>
                                </Button>
                              </EntryRejectionWithReason>
                            )}
                          {animal.verification_status ===
                            VerificationStatus.Draft &&
                            (user.role.name === "local-level" ||
                              user.role.name === "admin") && (
                              <AlertDialogWrapper
                                className="w-max"
                                title="Submit Application"
                                description="This animal record will be submitted. Continue?"
                                onConfirm={async (setOpen) => {
                                  await handleUpdateVerificationStatusMutation.mutateAsync(
                                    {
                                      id: animal.id,
                                      verification_status:
                                        VerificationStatus.Pending,
                                    },
                                  );
                                  setOpen && setOpen(false);
                                }}
                              >
                                <Button
                                  variant={"outline"}
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 cursor-pointer"
                                >
                                  <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                                  <span>Accept</span>
                                </Button>
                              </AlertDialogWrapper>
                            )}
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
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedAnimal(null);
            }}
            animalId={selectedAnimal}
          />
        </div>
      )}
      {isViewDialogOpen && selectedAnimal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <AnimalDetail
            onClose={() => {
              setViewDialogOpen(false);
              setSelectedAnimal(null);
            }}
            animalId={selectedAnimal}
          />
        </div>
      )}
    </div>
  );
}
