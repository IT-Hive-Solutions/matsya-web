"use client";
import { endpoints } from "@/core/contants/endpoints";
import { IUser } from "@/core/interfaces/user.interface";
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
import ConfirmationDialog from "../ui/confirmation-dialog";
import { ResetPasswordDTO } from "@/core/dtos/reset-password.dto";
import { mutateHandler } from "@/core/services/apiHandler/mutateHandler";
import { toast } from "sonner";
import AlertDialogWrapper from "../ui/AlertDialogWrapper";
import { useRouter } from "next/navigation";
import { deleteProtectedHandler } from "@/core/services/apiHandler/deleteHandler";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
  setEditing?: Dispatch<SetStateAction<boolean>>;
};

const UserLists = ({ currentConfig, setShowForm, setEditing }: Props) => {
  const [userLists, setUserLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();

  const userColumns: ColumnDef<IUser>[] = [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: ({ row }) => {
        const name = `${row.original.first_name} ${row.original.last_name}`;
        return <p>{name}</p>;
      },
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
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant={"ghost"}
              onClick={() => {
                router.replace(`?tab=user&id=${row.original.id}`);
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
    {
      accessorKey: "reset-password",
      header: "Reset Password",
      cell: ({ row }) => {
        return (
          <ConfirmationDialog
            cancelText="Cancel"
            confirmText="Reset"
            title="Are you sure to reset password for this user?"
            description="User will receive an email with instructions to reset their password."
            defaultOpen={false}
            onCancel={(setOpen) => {
              console.error("Reset Process Canceled!!!");
              setOpen(false);
            }}
            onConfirm={async (setOpen) => {
              setLoadingId(row.original.id);
              await resetPasswordMutation.mutateAsync({
                email: row.original.email,
                needs_password_change: true,
              });
              setOpen(false);
            }}
          >
            <Button
              isLoading={loadingId === row.original.id}
              className="w-full"
            >
              Reset Password
            </Button>
          </ConfirmationDialog>
        );
      },
    },
  ];
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      deleteProtectedHandler(endpoints.users.byId(id)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast.success("Data Deleted Successfully");
    },
  });
  const resetPasswordMutation = useMutation({
    mutationFn: (payload: ResetPasswordDTO) =>
      mutateHandler(endpoints.auth["reset-password"], payload),
    onSuccess: (res) => {
      if (res.password_changed) {
        toast.success("Password Changed Successfully!.", {
          description: "Please login with your new password.",
        });
        return;
      }

      toast.success("User created successfully!");
    },
    onError: (err) => {
      toast.error("Error creating user!");
    },
    onSettled: () => {
      setLoadingId(null);
    },
  });

  const { data: fetchedUserList, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchProtectedHandler(endpoints.users),
  });

  useEffect(() => {
    if (fetchedUserList?.data) {
      setUserLists(fetchedUserList?.data);
    }
  }, [fetchedUserList]);

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
