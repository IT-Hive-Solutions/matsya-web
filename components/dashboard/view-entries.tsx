"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/core/contants/endpoints";
import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { IUser } from "@/core/interfaces/user.interface";
import { fetchApiRouteHandler } from "@/core/services/apiHandler/fetchHandler";
import { updateApiRouteHandler } from "@/core/services/apiHandler/mutateHandler";
import { exportAnimalData } from "@/core/services/exportAnimalData";
import { useDebounceHook } from "@/hooks/useDebounceHook";
import { DataTableWithPagination } from "@/components/ui/data-table-with-pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCheckIcon,
  CheckCircleIcon,
  ChevronDown,
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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Loading from "../loading";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { Button } from "../ui/button";
import AnimalDetail from "./animal-detail";
import AnimalForm from "./animal-form";
import EntryRejectionWithReason from "./rejectEntryModal";

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

// ─── Nested Animal Sub-Table ─────────────────────────────────────────────────
function AnimalSubTable({
  animals,
  user,
  onEdit,
  onView,
  onUpdateStatus,
}: {
  animals: IAnimal[];
  user: IUser;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onUpdateStatus: (payload: {
    id: number;
    verification_status: VerificationStatus;
    reason?: string;
  }) => Promise<void>;
}) {
  return (
    <div className="bg-slate-50/80 border-t border-slate-200 px-6 py-3">
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-2.5 text-left font-semibold">Animal</th>
              <th className="px-4 py-2.5 text-left font-semibold">Tag</th>
              <th className="px-4 py-2.5 text-left font-semibold">Age</th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Production
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">
                Vaccination
              </th>
              <th className="px-4 py-2.5 text-left font-semibold">Status</th>
              <th className="px-4 py-2.5 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {animals.map((animal) => {
              return (
                <tr
                  key={animal.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* Animal */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          animal.verification_status === "validated"
                            ? "bg-emerald-500"
                            : animal.verification_status === "verified"
                              ? "bg-blue-500"
                              : animal.verification_status === "rejected"
                                ? "bg-red-500"
                                : animal.verification_status === "pending"
                                  ? "bg-amber-600"
                                  : "bg-amber-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          {animal.animal_type?.animal_name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {animal.animal_category.category_name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tag */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {animal.tag_number}
                  </td>

                  {/* Age */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>
                        {animal.age_years}y {animal.age_months}m
                      </span>
                    </div>
                  </td>

                  {/* Production */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Activity className="h-3 w-3 text-slate-400" />
                      <span>
                        {animal.production_capacity.capacity_name || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Vaccination */}
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={`${
                        animal.is_vaccination_applied
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      } border-0 text-xs px-2 py-0.5`}
                    >
                      {animal.is_vaccination_applied
                        ? "Applied"
                        : "Not Applied"}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={animal.verification_status} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {/* View */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(animal.id)}
                        className="h-7 w-7 p-0 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>

                      {/* Edit */}
                      {(() => {
                        const isRejected =
                          animal.verification_status ===
                          VerificationStatus.Rejected;
                        const isValidated =
                          animal.verification_status ===
                          VerificationStatus.Validated;
                        const isVaccinator = user.role.name === "vaccinator";
                        const isDistrictLevel =
                          user.role.name === "district-level";
                        const ownsData = user.id === animal.user_created.id;

                        const canEdit =
                          (!isRejected && !isValidated && !isDistrictLevel) ||
                          (isRejected &&
                            isVaccinator &&
                            !isValidated &&
                            ownsData);

                        return canEdit ? (
                          <Button
                            variant="ghost"
                            onClick={() => onEdit(animal.id)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        ) : null;
                      })()}
                      {/* Validate */}
                      {animal.verification_status ===
                        VerificationStatus.Verified &&
                        (user.role.name === "admin" ||
                          user.role.name === "province-level") && (
                          <AlertDialogWrapper
                            className="w-max"
                            title="Validate Animal"
                            description="This animal record will be marked as validated. Continue?"
                            onConfirm={async (setOpen) => {
                              await onUpdateStatus({
                                id: animal.id,
                                verification_status:
                                  VerificationStatus.Validated,
                              });
                              setOpen?.(false);
                            }}
                          >
                            <div className="flex items-center gap-1 cursor-pointer text-emerald-700 text-xs font-medium px-2 py-1 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors">
                              <CheckCheckIcon className="h-3 w-3" />
                              Validate
                            </div>
                          </AlertDialogWrapper>
                        )}

                      {/* Verify */}
                      {animal.verification_status ===
                        VerificationStatus.Pending &&
                        (user.role.name === "district-level" ||
                          user.role.name === "admin") && (
                          <AlertDialogWrapper
                            className="w-max"
                            title="Verify Animal"
                            description="This animal record will be marked as verified. Continue?"
                            onConfirm={async (setOpen) => {
                              await onUpdateStatus({
                                id: animal.id,
                                verification_status:
                                  VerificationStatus.Verified,
                              });
                              setOpen?.(false);
                            }}
                            triggerVariant="outline"
                          >
                            <div className="flex items-center gap-1 cursor-pointer text-blue-700 text-xs font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                              <CheckCircleIcon className="h-3 w-3" />
                              Verify
                            </div>
                          </AlertDialogWrapper>
                        )}

                      {/* Accept (Draft → Pending) */}
                      {animal.verification_status ===
                        VerificationStatus.Draft &&
                        (user.role.name === "local-level" ||
                          user.role.name === "admin") && (
                          <AlertDialogWrapper
                            className="w-max"
                            title="Submit Application"
                            description="This animal record will be submitted. Continue?"
                            onConfirm={async (setOpen) => {
                              await onUpdateStatus({
                                id: animal.id,
                                verification_status: VerificationStatus.Pending,
                              });
                              setOpen?.(false);
                            }}
                            triggerVariant="outline"
                          >
                            <div className="flex items-center gap-1 cursor-pointer text-blue-700 text-xs font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                              <CheckCircleIcon className="h-3 w-3" />
                              Accept
                            </div>
                          </AlertDialogWrapper>
                        )}

                      {/* Reject */}
                      {animal.verification_status ===
                        VerificationStatus.Draft &&
                        (user.role.name === "local-level" ||
                          user.role.name === "admin") && (
                          <EntryRejectionWithReason
                            className="w-max"
                            title="Reject Animal?"
                            description="This animal record will be marked as rejected. Continue?"
                            onConfirm={async (setOpen, reason) => {
                              await onUpdateStatus({
                                id: animal.id,
                                verification_status:
                                  VerificationStatus.Rejected,
                                reason,
                              });
                              setOpen?.(false);
                            }}
                            triggerVariant="outline"
                          >
                            <div className="flex items-center gap-1 cursor-pointer text-red-700 text-xs font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors">
                              <LucideOctagonMinus className="h-3 w-3" />
                              Reject
                            </div>
                          </EntryRejectionWithReason>
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OwnerAnimalView({
  user,
  setActiveTab,
}: ViewEntriesPageProps) {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [filteredData, setFilteredData] = useState<GroupedAnimal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchValue = useDebounceHook({
    value: searchTerm,
    delay: 300,
  });

  const handleUpdateVerificationStatusMutation = useMutation({
    mutationFn: (payload: {
      id: number;
      verification_status: VerificationStatus;
      reason?: string;
    }) =>
      updateApiRouteHandler(
        endpoints.animal_info.update_animal_status(payload.id),
        {
          verification_status: payload.verification_status,
          rejection_reason: payload.reason,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Status updated successfully!");
    },
    onError: () => {
      toast.error("Error updating status!");
    },
  });

  const {
    data: fetchedAnimalList,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["animals", debouncedSearchValue],
    queryFn: () =>
      fetchApiRouteHandler<IAnimal[]>(endpoints.animal_info, {
        searchQuery: debouncedSearchValue,
      }),
  });

  useEffect(() => {
    if (!fetchedAnimalList?.data) {
      setFilteredData([]);
      return;
    }

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
              district: animal.owners_id?.district_id?.id,
            },
            animals: [],
          };
        }
        acc[ownerId].animals.push(animal);
        return acc;
      },
      {},
    );

    const groupedData = Object.values(grouped);

    setFilteredData(
      groupedData.filter(
        (group) =>
          group.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.owner?.contact?.includes(searchTerm) ||
          group.animals?.some((a) =>
            a.tag_number.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      ),
    );
  }, [fetchedAnimalList, searchTerm]);

  // ─── Owner Table Columns ───────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<GroupedAnimal>[]>(
    () => [
      // Expand toggle
      {
        id: "expand",
        header: "",
        size: 40,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ),
      },
      // Owner
      {
        id: "owner",
        header: "Owner",
        cell: ({ row }) => {
          const { name, id } = row.original.owner;
          return (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">
                  {name}
                </p>
                <p className="text-xs text-slate-400">ID: {id}</p>
              </div>
            </div>
          );
        },
      },
      // Contact
      {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{row.original.owner.contact}</span>
          </div>
        ),
      },
      // Location
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => {
          const { localLevel, ward } = row.original.owner;
          const firstAnimal = row.original.animals[0];
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate max-w-40">
                  {localLevel}, Ward {ward}
                </span>
              </div>
              {firstAnimal?.latitude && firstAnimal?.longitude && (
                <Link
                  target="_blank"
                  href={`https://www.google.com/maps/search/${firstAnimal.latitude},+${firstAnimal.longitude}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 underline"
                >
                  <MapPinnedIcon className="h-3 w-3" />
                  Locate on Map
                </Link>
              )}
            </div>
          );
        },
      },
      // Animal count
      {
        id: "animals",
        header: "Animals",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-emerald-100 rounded">
              <Layers className="h-3 w-3 text-emerald-700" />
            </div>
            <span className="text-sm font-semibold text-slate-900">
              {row.original.animals.length}
            </span>
          </div>
        ),
      },
      // Status summary
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const { animals } = row.original;
          const validatedCount = animals.filter(
            (a) => a.verification_status === "validated",
          ).length;
          const pendingCount = animals.filter(
            (a) => a.verification_status === "pending",
          ).length;
          return (
            <div className="flex gap-1.5 flex-wrap">
              {validatedCount > 0 && (
                <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCheckIcon className="h-3 w-3 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-700">
                    {validatedCount} Validated
                  </span>
                </div>
              )}
              {pendingCount > 0 && (
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    {pendingCount} Pending
                  </span>
                </div>
              )}
              {validatedCount === 0 && pendingCount === 0 && (
                <span className="text-xs text-slate-400">—</span>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  // ─── Sub-component renderer (closure over user + mutation) ─────────────────
  const renderSubComponent = (row: Row<GroupedAnimal>) => (
    <AnimalSubTable
      animals={row.original.animals}
      user={user}
      onEdit={(id) => {
        setSelectedAnimal(id);
        setEditDialogOpen(true);
      }}
      onView={(id) => {
        setSelectedAnimal(id);
        setViewDialogOpen(true);
      }}
      onUpdateStatus={(payload) =>
        handleUpdateVerificationStatusMutation.mutateAsync(payload)
      }
    />
  );

  if (isLoading && !isFetching) return <Loading />;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50/50">
      <div className="flex flex-col gap-4 h-[calc(100vh-20vh)]">
        {/* Search & Export */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by owner name, contact, or tag number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-slate-200 focus-visible:ring-slate-900"
            />
          </div>
          <Button
            onClick={() => exportAnimalData(fetchedAnimalList?.data ?? [])}
            className="hover:cursor-pointer shrink-0"
          >
            Export Excel
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <DataTableWithPagination
            table={table}
            isLoading={isFetching}
            fullWidth
            renderSubComponent={renderSubComponent}
          />
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

      {/* View Dialog */}
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
