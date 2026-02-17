"use client"
import { endpoints } from "@/core/contants/endpoints";
import { IAnimalType } from "@/core/interfaces/animalType.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Config } from "../dashboard/management-pages";
import Loading from "../loading";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import { Input } from "../ui/input";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};


export const animalTypesColumns: ColumnDef<IAnimalType>[] = [
  {
    accessorKey: "animal_name",
    header: "Name",
  },
];

const AnimalTypesLists = ({ currentConfig, setShowForm }: Props) => {
  const [animalTypesLists, setAnimalTypesLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: fetchedAnimalTypesList, isLoading } = useQuery({
    queryKey: ["animal-type"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_types),
  });
  useEffect(() => {
    if (fetchedAnimalTypesList?.data) {
      setAnimalTypesLists(fetchedAnimalTypesList?.data);
    }
  }, [fetchedAnimalTypesList]);
  console.log({ animalTypesLists });

  const animalTypesTable = useCustomReactPaginatedTable<
    IAnimalType,
    any
  >({
    data: animalTypesLists,
    columns: animalTypesColumns,
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
      />

      {animalTypesLists?.length > 0 ? (
        <DataTableWithPagination table={animalTypesTable} />
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

export default AnimalTypesLists;
