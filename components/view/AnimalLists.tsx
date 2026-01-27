"use client";
import { endpoints } from "@/core/contants/endpoints";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCheckIcon,
  CheckCircleIcon,
  Edit2,
  Eye,
  MoreVertical,
  MoreVerticalIcon,
  Plus,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Config } from "../dashboard/management-pages";
import Loading from "../loading";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import { Input } from "../ui/input";
import { getMonthLabel } from "@/core/enums/month.enum";
import { Badge } from "../ui/badge";
import {
  getVerficationStatusLabel,
  VerificationStatus,
} from "@/core/enums/verification-status.enum";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};
export const animalColumns: ColumnDef<IAnimal>[] = [
  {
    accessorKey: "tag_number",
    header: "Tag Number",
  },
  {
    accessorKey: "animal_type.animal_name",
    header: "Type",
  },
  {
    accessorKey: "animal_category.category_name",
    header: "Category",
  },
  {
    accessorKey: "owners_id.owners_name",
    header: "Owner's Name",
  },
  {
    accessorKey: "is_vaccination_applied",
    header: "Vaccination Applied",
  },
  {
    accessorKey: "birth_date",
    header: "Birth Year-Month",
    cell: ({ row }) => {
      return `${row.original.age_years}-${getMonthLabel(row.original.age_months)}`;
    },
  },
  {
    accessorKey: "production_capacity",
    header: "Production Capacity",
  },
  {
    accessorKey: "verification_status",
    header: "Verification Status",
    cell: ({ row }) => {
      const status = row.original.verification_status;
      return (
        <Badge
          variant={
            status === VerificationStatus.Pending ? "outline" : "default"
          }
        >
          {getVerficationStatusLabel(status)}
        </Badge>
      );
    },
  },
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
            <div className="w-full flex items-center gap-2 py-2 px-2 hover:bg-primary/80 hover:text-primary-foreground rounded ">
              <CheckCircleIcon className="hover:scale-[1.1] w-4 h-4" />{" "}
              <label className="text-sm ">Verify</label>
            </div>
            <div className="w-full flex items-center gap-2 py-2 px-2 hover:bg-primary/80 hover:text-primary-foreground rounded ">
              <CheckCheckIcon className="hover:scale-[1.1] w-4 h-4" />{" "}
              <label className="text-sm ">Validate</label>
            </div>
            <div className="w-full flex items-center gap-2 py-2 px-2 hover:bg-primary/80 hover:text-primary-foreground rounded ">
              <CheckCheckIcon className="hover:scale-[1.1] w-4 h-4" />{" "}
              <label className="text-sm ">Reject</label>
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
];

const AnimalLists = ({ currentConfig, setShowForm }: Props) => {
  const [animalLists, setAnimalLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-xs"
      />

      {animalLists?.length > 0 ? (
        <DataTableWithPagination table={animalTable} />
      ) : (
        <Card className="p-12 text-center border-border/50">
          <p className="text-muted-foreground mb-4 text-sm">
            No items yet. Create your first {currentConfig.title.toLowerCase()}.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="gap-2 hover:cursor-pointer"
          >
            <Plus size={18} />
            Create Now
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AnimalLists;
