"use client";
import { endpoints } from "@/core/contants/endpoints";
import { IOffice } from "@/core/interfaces/office.interface";
import { fetchHandler } from "@/core/services/apiHandler/fetchHandler";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
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
import { useRouter } from "next/navigation";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { deleteHandler } from "@/core/services/apiHandler/deleteHandler";
import { toast } from "sonner";
import { directusEndpoints } from "@/core/contants/directusEndpoints";

const PAGE_SIZE = 10;

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditing?: Dispatch<SetStateAction<boolean>>;
};
export const officeColumns: ColumnDef<IOffice>[] = [
  {
    accessorKey: "office_name",
    header: "Name",
  },
  {
    accessorKey: "office_email",
    header: "Email",
  },
  {
    accessorKey: "office_contact",
    header: "Contact",
  },
  {
    accessorKey: "province_id.province_name",
    header: "Province",
  },
  {
    accessorKey: "district_id.district_name",
    header: "District",
  },
];

const OfficeLists = ({ currentConfig, setShowForm, setEditing }: Props) => {
  const [officeLists, setOfficeLists] = useState<IOffice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  const officeColumnsWithAction: ColumnDef<IOffice>[] = [
    ...officeColumns,
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              onClick={() => {
                router.replace(`?tab=office&id=${row.original.id}`);
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      deleteHandler(directusEndpoints.office.byId(id)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["office"],
      });
      toast.success("Data Deleted Successfully");
    },
  });

  const {
    data: fetchedOfficeList,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["office", pagination, searchQuery],
    queryFn: () =>
      fetchHandler<IOffice[]>(directusEndpoints.office, {
        fields: ["*.*", "district_id.*", "district_id.province_id.*"],
        page: pagination.pageIndex + 1, // Directus pages start at 1
        limit: pagination.pageSize,
        searchQuery: searchQuery || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (fetchedOfficeList?.data) {
      setOfficeLists(fetchedOfficeList?.data);
    }
  }, [fetchedOfficeList]);

  const totalCount =
    fetchedOfficeList?.meta?.filter_count ??
    fetchedOfficeList?.meta?.total_count ??
    0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const officeTable = useCustomReactPaginatedTable<IOffice, any>({
    data: officeLists,
    columns: officeColumnsWithAction,
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

      {officeLists?.length > 0 ? (
        <DataTableWithPagination
          table={officeTable}
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

export default OfficeLists;
