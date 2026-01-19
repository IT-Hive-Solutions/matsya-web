import { endpoints } from "@/core/contants/endpoints";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useQuery } from "@tanstack/react-query";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Config } from "../dashboard/management-pages";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import Loading from "../loading";
import { IOffice } from "@/core/interfaces/office.interface";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
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
    accessorKey: "office_address",
    header: "Address",
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

const OfficeLists = ({ currentConfig, setShowForm }: Props) => {
  const [officeLists, setOfficeLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: fetchedOfficeList, isLoading } = useQuery({
    queryKey: ["office"],
    queryFn: () => fetchProtectedHandler(endpoints.office),
  });
  useEffect(() => {
    if (fetchedOfficeList?.data) {
      setOfficeLists(fetchedOfficeList?.data);
    }
  }, [fetchedOfficeList]);
  console.log({ officeLists });

  const officeTable = useCustomReactPaginatedTable<IOffice, any>({
    data: officeLists,
    columns: officeColumns,
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
