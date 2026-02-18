"use client";
import { endpoints } from "@/core/contants/endpoints";
import { IOffice } from "@/core/interfaces/office.interface";
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
import { useRouter } from "next/navigation";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { deleteProtectedHandler } from "@/core/services/apiHandler/deleteHandler";
import { toast } from "sonner";

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
  const [officeLists, setOfficeLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
              variant={"ghost"}
              onClick={() => {
                router.replace(`?tab=office&id=${row.original.id}`);
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      deleteProtectedHandler(endpoints.office.byId(id)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["office"],
      });
      toast.success("Data Deleted Successfully");
    },
  });
  const { data: fetchedOfficeList, isLoading } = useQuery({
    queryKey: ["office"],
    queryFn: () => fetchProtectedHandler(endpoints.office),
  });
  useEffect(() => {
    if (fetchedOfficeList?.data) {
      setOfficeLists(fetchedOfficeList?.data);
    }
  }, [fetchedOfficeList]);

  const officeTable = useCustomReactPaginatedTable<IOffice, any>({
    data: officeLists,
    columns: officeColumnsWithAction,
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

      {officeLists?.length > 0 ? (
        <DataTableWithPagination table={officeTable} />
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
