"use client";
import { endpoints } from "@/core/contants/endpoints";
import { IAnimalCategories } from "@/core/interfaces/animalCategory.interface";
import { fetchHandler } from "@/core/services/apiHandler/fetchHandler";
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
import { deleteHandler } from "@/core/services/apiHandler/deleteHandler";
import { toast } from "sonner";
import { directusEndpoints } from "@/core/contants/directusEndpoints";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditing?: Dispatch<SetStateAction<boolean>>;
};
export const animalCategoriesColumns: ColumnDef<IAnimalCategories>[] = [
  {
    accessorKey: "category_name",
    header: "Name",
  },
];

const AnimalCategoriesLists = ({
  currentConfig,
  setShowForm,
  setEditing,
}: Props) => {
  const [animalCategoriesLists, setAnimalCategoriesLists] = useState<
    IAnimalCategories[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const animalCategoriesColumnsWithAction: ColumnDef<IAnimalCategories>[] = [
    ...animalCategoriesColumns,
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant={"ghost"}
              onClick={() => {
                router.replace(`?tab=livestock-category&id=${row.original.id}`);
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
  const { data: fetchedAnimalCategoriesList, isLoading } = useQuery({
    queryKey: ["animal-categories"],
    queryFn: () =>
      fetchHandler<IAnimalCategories[]>(directusEndpoints.animal_category),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      deleteHandler(directusEndpoints.animal_category.byId(id)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["animal-categories"],
      });
      toast.success("Data Deleted Successfully");
    },
  });
  useEffect(() => {
    if (fetchedAnimalCategoriesList?.data) {
      setAnimalCategoriesLists(fetchedAnimalCategoriesList?.data);
    }
  }, [fetchedAnimalCategoriesList]);

  const animalCategoriesTable = useCustomReactPaginatedTable<
    IAnimalCategories,
    any
  >({
    data: animalCategoriesLists,
    columns: animalCategoriesColumnsWithAction,
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

      {animalCategoriesLists?.length > 0 ? (
        <DataTableWithPagination table={animalCategoriesTable} />
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

export default AnimalCategoriesLists;
