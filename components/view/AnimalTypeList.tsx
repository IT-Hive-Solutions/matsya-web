"use client";
import { endpoints } from "@/core/contants/endpoints";
import { IAnimalType } from "@/core/interfaces/animalType.interface";
import { fetchHandler } from "@/core/services/apiHandler/fetchHandler";
import {
  PAGE_SIZE,
  useCustomReactPaginatedTable,
} from "@/hooks/reactTableHook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
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
import { Badge } from "../ui/badge";
import { useDebounceHook } from "@/hooks/useDebounceHook";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditing?: Dispatch<SetStateAction<boolean>>;
};

export const animalTypesColumns: ColumnDef<IAnimalType>[] = [
  {
    accessorKey: "sn",
    header: "S.N.",
    cell: ({ row }) => {
      return <p className="min-w-24 pr-2">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "animal_name",
    header: "Name",
    cell: ({ row }) => {
      return <p className="min-w-24 pr-2">{row.original.animal_name}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <Badge
          variant={row.original.status === "published" ? "default" : "outline"}
          className="min-w-24 "
        >{`${row.original.status.charAt(0).toUpperCase()}${row.original.status.slice(1)}`}</Badge>
      );
    },
  },
];

const AnimalTypesLists = ({
  currentConfig,
  setShowForm,
  setEditing,
}: Props) => {
  const [animalTypesLists, setAnimalTypesLists] = useState<IAnimalType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  const debouncedSearchValue = useDebounceHook({
    value: searchQuery,
    delay: 300,
  });

  const animalTypesColumnsWithAction: ColumnDef<IAnimalType>[] = [
    ...animalTypesColumns,
    {
      accessorKey: "action",
      header: "Action",

      cell: ({ row }) => {
        return (
          <div className="w-max flex items-center gap-2">
            <Button
              variant={"outline"}
              onClick={() => {
                router.replace(`?tab=livestock-type&id=${row.original.id}`);
                setEditing && setEditing(true);
                setShowForm(true);
              }}
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <AlertDialogWrapper
              description="You cannot undo once deleted!"
              title="Are you sure?"
              triggerVariant={"outline"}
              onConfirm={() => {
                deleteMutation.mutateAsync(row.original.id);
              }}
              className="text-destructive"
            >
              <Trash className="w-4 h-4" />
              Delete
            </AlertDialogWrapper>
          </div>
        );
      },
      // size: 150,
    },
  ];

  const {
    data: fetchedAnimalTypesList,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["animal-type", pagination, debouncedSearchValue],
    queryFn: () =>
      fetchHandler<IAnimalType[]>(directusEndpoints.animal_types, {
        page: pagination.pageIndex + 1, // Directus pages start at 1
        limit: pagination.pageSize,
        searchQuery: debouncedSearchValue || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      deleteHandler(directusEndpoints.animal_types.byId(id)),
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

  const totalCount =
    fetchedAnimalTypesList?.meta?.filter_count ??
    fetchedAnimalTypesList?.meta?.total_count ??
    0;

  const animalTypesTable = useCustomReactPaginatedTable<IAnimalType, any>({
    data: animalTypesLists,
    columns: animalTypesColumnsWithAction,
    pagination: pagination,
    setPagination: setPagination,
    total: totalCount,
  });

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {animalTypesLists?.length > 0 ? (
        <DataTableWithPagination
          table={animalTypesTable}
          isLoading={isFetching || isLoading}
        />
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
