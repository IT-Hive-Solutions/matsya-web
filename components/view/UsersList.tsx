import { endpoints } from "@/core/contants/endpoints";
import { IUser } from "@/core/interfaces/user.interface";
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
export const userColumns: ColumnDef<IUser>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone_number",
    header: "Contact",
  },
  {
    accessorKey: "office_id.office_name",
    header: "Office",
  },
  {
    accessorKey: "office_id.province_id.province_name",
    header: "Province",
  },
  {
    accessorKey: "office_id.district_id.district_name",
    header: "District",
  },
];

const UserLists = ({ currentConfig, setShowForm }: Props) => {
  const [userLists, setUserLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: fetchedUserList, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchProtectedHandler(endpoints.users),
  });
  useEffect(() => {
    if (fetchedUserList?.data) {
      setUserLists(fetchedUserList?.data);
    }
  }, [fetchedUserList]);
  console.log({ userLists });

  const userTable = useCustomReactPaginatedTable<IUser, any>({
    data: userLists,
    columns: userColumns,
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

      {userLists?.length > 0 ? (
        <DataTableWithPagination table={userTable} />
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

export default UserLists;
