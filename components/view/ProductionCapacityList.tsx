"use client";
import { directusEndpoints } from "@/core/contants/directusEndpoints";
import { IProductionCapacity } from "@/core/interfaces/productionCapacity.interface";
import { deleteHandler } from "@/core/services/apiHandler/deleteHandler";
import { fetchHandler } from "@/core/services/apiHandler/fetchHandler";
import {
  PAGE_SIZE,
  useCustomReactPaginatedTable,
} from "@/hooks/reactTableHook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Edit, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "sonner";
import { Config } from "../dashboard/management-pages";
import Loading from "../loading";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import { Input } from "../ui/input";
import { useDebounceHook } from "@/hooks/useDebounceHook";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditing?: Dispatch<SetStateAction<boolean>>;
};

export const productionCapacityColumns: ColumnDef<IProductionCapacity>[] = [
  {
    accessorKey: "sn",
    header: "S.N.",
    cell: ({ row }) => {
      return <p className="min-w-24 pr-2">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "capacity_name",
    header: "Name",
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

const ProductionCapacityLists = ({
  currentConfig,
  setShowForm,
  setEditing,
}: Props) => {
  const [productionCapacityLists, setProductionCapacityLists] = useState<
    IProductionCapacity[]
  >([]);
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

  const productionCapacityColumnsWithAction: ColumnDef<IProductionCapacity>[] =
    [
      ...productionCapacityColumns,
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <Button
                variant={"outline"}
                onClick={() => {
                  router.replace(
                    `?tab=production-capacity&id=${row.original.id}`,
                  );
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
      },
    ];

  const {
    data: fetchedProductionCapacityList,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["production-capacity", pagination, debouncedSearchValue],
    queryFn: () =>
      fetchHandler<IProductionCapacity[]>(
        directusEndpoints.production_capacity,
        {
          page: pagination.pageIndex + 1, // Directus pages start at 1
          limit: pagination.pageSize,
          searchQuery: debouncedSearchValue || undefined,
        },
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      deleteHandler(directusEndpoints.production_capacity.byId(id)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["production-capacity"],
      });
      toast.success("Data Deleted Successfully");
    },
  });
  useEffect(() => {
    if (fetchedProductionCapacityList?.data) {
      setProductionCapacityLists(fetchedProductionCapacityList?.data);
    }
  }, [fetchedProductionCapacityList]);

  const totalCount =
    fetchedProductionCapacityList?.meta?.filter_count ??
    fetchedProductionCapacityList?.meta?.total_count ??
    0;
  const productionCapacityTable = useCustomReactPaginatedTable<
    IProductionCapacity,
    any
  >({
    data: productionCapacityLists,
    columns: productionCapacityColumnsWithAction,
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

      {productionCapacityLists?.length > 0 ? (
        <DataTableWithPagination
          table={productionCapacityTable}
          isLoading={isLoading || isFetching}
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

export default ProductionCapacityLists;
