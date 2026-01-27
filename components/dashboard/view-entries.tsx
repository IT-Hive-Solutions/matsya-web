"use client";

import { Card } from "@/components/ui/card";
import { endpoints } from "@/core/contants/endpoints";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { IUser } from "@/core/interfaces/user.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCheckIcon,
  CheckCircleIcon,
  Edit2,
  LucideOctagonMinus,
  MoreVertical,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import Loading from "../loading";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { Button } from "../ui/button";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { animalColumns } from "../view/AnimalLists";
import { ColumnDef } from "@tanstack/react-table";
import { updateProtectedHandler } from "@/core/services/apiHandler/mutateHandler";
import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { toast } from "sonner";

interface ViewEntriesPageProps {
  user: IUser;
  setActiveTab: (tab: string) => void;
}

export default function ViewEntriesPage({
  user,
  setActiveTab,
}: ViewEntriesPageProps) {
  const queryClient = useQueryClient();

  const entityColumn: ColumnDef<IAnimal>[] = [
    ...animalColumns,
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <Popover>
            <PopoverTrigger
              className="hover:bg-transparent hover:text-primary hover:scale-[1.1]"
              asChild
            >
              <Button
                variant="ghost"
                className={
                  "w-full justify-start text-left font-normal text-primary hover:cursor-pointer"
                }
              >
                <MoreVertical
                  className={"   "}
                  strokeWidth={2}
                  cursor={"pointer"}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white px-4 py-2 rounded-md shadow-lg flex flex-col w-max h-max p-2 gap-1 z-99999">
              <div className="flex flex-col w-full h-full  gap-4 px-2 hover:bg-primary/80 hover:text-primary-foreground rounded ">
                <div
                  className={`flex py-2 text-left items-center gap-2 transition-all hover:cursor-pointer`}
                >
                  <Edit2
                    className="hover:scale-[1.1] w-4 h-4"
                    strokeWidth={2}
                    cursor={"pointer"}
                  />
                  <label className="text-sm ">Edit</label>
                </div>
              </div>
              <div className="h-px bg-gray-400 w-full rounded-full" />
              <AlertDialogWrapper
                title="Are you sure?"
                description="This data will be verifed and cannot be undone!"
                onConfirm={async (setOpen) => {
                  await handleUpdateVerificationStatusMutation.mutateAsync({
                    id: row.original.id,
                    verification_status: VerificationStatus.Verified,
                  });
                  setOpen && setOpen(false);
                }}
              >
                <div className="w-full flex items-center gap-2 py-2 px-2 hover:bg-primary/80 hover:text-primary-foreground rounded ">
                  <CheckCircleIcon className="hover:scale-[1.1] w-4 h-4" />
                  <label className="text-sm ">Verify</label>
                </div>
              </AlertDialogWrapper>
              <AlertDialogWrapper
                title="Are you sure?"
                description="This data will be validated and cannot be undone!"
                onConfirm={async (setOpen) => {
                  await handleUpdateVerificationStatusMutation.mutateAsync({
                    id: row.original.id,
                    verification_status: VerificationStatus.Validated,
                  });
                  setOpen && setOpen(false);
                }}
              >
                <div className="w-full flex items-center gap-2 py-2 px-2 hover:bg-primary/80 hover:text-primary-foreground rounded ">
                  <CheckCheckIcon className="hover:scale-[1.1] w-4 h-4" />
                  <label className="text-sm ">Validate</label>
                </div>
              </AlertDialogWrapper>
              <AlertDialogWrapper
                title="Are you sure?"
                description="This data will be rejected and cannot be undone!"
                onConfirm={async (setOpen) => {
                  await handleUpdateVerificationStatusMutation.mutateAsync({
                    id: row.original.id,
                    verification_status: VerificationStatus.Rejected,
                  });
                  setOpen && setOpen(false);
                }}
              >
                <div className="w-full flex items-center gap-2 py-2 px-2 hover:bg-primary/80 hover:text-primary-foreground rounded ">
                  <LucideOctagonMinus className="hover:scale-[1.1] w-4 h-4 text-destructive" />
                  <label className="text-sm ">Reject</label>
                </div>
              </AlertDialogWrapper>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];
  const [animalLists, setAnimalLists] = useState([]);

  const handleUpdateVerificationStatusMutation = useMutation({
    mutationFn: (payload: {
      id: number;
      verification_status: VerificationStatus;
    }) =>
      updateProtectedHandler(
        endpoints.animal_info.update_animal_status(payload.id),
        { verification_status: payload.verification_status },
      ),
    onSuccess: (res) => {
      console.log("error...", { res });
      queryClient.invalidateQueries({
        queryKey: ["animals"],
      });
      toast.success("Status updated successfully!");
    },
    onError: (err) => {
      console.log("error...", { err });

      toast.error("Error creating animal category!");
    },
  });

  const { data: fetchedAnimalList, isLoading } = useQuery({
    queryKey: ["animals"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_info),
  });
  useEffect(() => {
    if (fetchedAnimalList?.data) {
      setAnimalLists(fetchedAnimalList?.data);
    }
  }, [fetchedAnimalList]);

  const animalTable = useCustomReactPaginatedTable<IAnimal, any>({
    data: animalLists,
    columns: entityColumn,
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
