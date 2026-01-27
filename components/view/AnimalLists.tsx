"use client";
import { endpoints } from "@/core/contants/endpoints";
import { getMonthLabel } from "@/core/enums/month.enum";
import {
  getVerficationStatusLabel,
  VerificationStatus,
} from "@/core/enums/verification-status.enum";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Config } from "../dashboard/management-pages";
import Loading from "../loading";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import { Input } from "../ui/input";

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
        <div>
          {status == VerificationStatus.Validated ? (
            <div className="w-full flex items-center flex-wrap gap-2">
              <Badge variant={"default"}>
                {getVerficationStatusLabel(status)}
              </Badge>
              <Badge variant={"default"}>
                {getVerficationStatusLabel(status)}
              </Badge>
            </div>
          ) : (
            <Badge
              variant={
                status === VerificationStatus.Pending
                  ? "outline"
                  : status === VerificationStatus.Rejected
                    ? "destructive"
                    : "default"
              }
            >
              {getVerficationStatusLabel(status)}
            </Badge>
          )}
        </div>
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
