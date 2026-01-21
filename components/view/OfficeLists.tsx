import { endpoints } from "@/core/contants/endpoints";
import { IOffice } from "@/core/interfaces/office.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef
} from "@tanstack/react-table";
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
