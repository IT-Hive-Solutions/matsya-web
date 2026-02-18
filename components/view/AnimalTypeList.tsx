"use client";
import { endpoints } from "@/core/contants/endpoints";
import { IAnimalType } from "@/core/interfaces/animalType.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Config } from "../dashboard/management-pages";
import Loading from "../loading";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import { Input } from "../ui/input";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { useRouter } from "next/navigation";
import { deleteProtectedHandler } from "@/core/services/apiHandler/deleteHandler";
import { toast } from "sonner";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditing?: Dispatch<SetStateAction<boolean>>;
};

export const animalTypesColumns: ColumnDef<IAnimalType>[] = [
  {
    accessorKey: "animal_name",
    header: "Name",
  },
];

const AnimalTypesLists = ({
  currentConfig,
  setShowForm,
  setEditing,
}: Props) => {
  const [animalTypesLists, setAnimalTypesLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const animalTypesColumnsWithAction: ColumnDef<IAnimalType>[] = [
    ...animalTypesColumns,
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant={"ghost"}
              onClick={() => {
                router.replace(`?tab=livestock-type&id=${row.original.id}`);
                setEditing && setEditing(true);
                setShowForm(true);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialogWrapper
              description="You cannot undo once deleted!"
              title="Are you sure?"
              triggerVariant={"ghost"}
              onConfirm={() => {
                deleteMutation.mutateAsync(row.original.id);
              }}
            >
              <Trash className="w-4 h-4" />
            </AlertDialogWrapper>
          </div>
        );
      },
    },
  ];

  const { data: fetchedAnimalTypesList, isLoading } = useQuery({
    queryKey: ["animal-type"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_types),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      deleteProtectedHandler(endpoints.animal_types.byId(id)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["animal-type"],
      });
      toast.success("Data Deleted Successfully");
    },
  });
  useEffect(() => {
    if (fetchedAnimalTypesList?.data) {
      setAnimalTypesLists(fetchedAnimalTypesList?.data);
    }
  }, [fetchedAnimalTypesList]);

  const animalTypesTable = useCustomReactPaginatedTable<IAnimalType, any>({
    data: animalTypesLists,
    columns: animalTypesColumnsWithAction,
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
