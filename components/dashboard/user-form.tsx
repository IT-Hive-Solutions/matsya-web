"use client";

import type React from "react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, X } from "lucide-react";
import { CreateUserDTO, CreateUserSchema } from "@/core/dtos/user.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  mutateHandler,
  updateHandler,
} from "@/core/services/apiHandler/mutateHandler";
import { endpoints } from "@/core/contants/endpoints";
import { fetchHandler } from "@/core/services/apiHandler/fetchHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  IUser,
  UserType,
  userTypeOptions,
} from "@/core/interfaces/user.interface";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../loading";
import { IOffice } from "@/core/interfaces/office.interface";
import { directusEndpoints } from "@/core/contants/directusEndpoints";

interface UserFormProps {
  onClose: () => void;
  isEditing?: boolean;
  setEditing?: Dispatch<SetStateAction<boolean>>;
}

export default function UserForm({
  onClose,
  isEditing = false,
  setEditing,
}: UserFormProps) {
  const [officeData, setOfficeData] = useState<
    { label: string; value: string }[]
  >([]);

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const paramsId = searchParams.get("id");
    if (paramsId) {
      setId(paramsId);
    }
  }, [searchParams.get("id")]);

  const form = useForm<CreateUserDTO>({
    defaultValues: {
      email: "",
      full_name: "",
      office_id: undefined,
      phone_number: "",
      user_type: undefined,
    },
    resolver: zodResolver(CreateUserSchema),
  });
  const { data: fetchedUserDetail, isLoading } = useQuery({
    queryKey: ["user-single", id],
    queryFn: () => fetchHandler<IUser>(directusEndpoints.users.byId(id ?? "")),
    enabled: !!id && isEditing,
  });

  const handleClose = () => {
    form.reset();
    setId(null);
    setEditing && setEditing(false);
    router.replace("/");
    onClose();
  };

  const { data: officeFetched } = useQuery({
    queryKey: ["office"],
    queryFn: () => fetchHandler<IOffice[]>(directusEndpoints.office),
  });

  useEffect(() => {
    if (officeFetched?.data) {
      const data = officeFetched?.data?.map((p) => ({
        label: p.office_name,
        value: String(p.id),
      }));
      setOfficeData(data);
    }
  }, [officeFetched]);

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserDTO) =>
      mutateHandler(endpoints.users, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast.success("User created successfully!");
      handleClose();
    },
    onError: (err) => {
      toast.error("Error creating user!");
    },
  });
  const updateUserMutation = useMutation({
    mutationFn: (payload: CreateUserDTO) =>
      updateHandler(endpoints.users.byId(id ?? ""), payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast.success("User updated successfully!");
      handleClose();
    },
    onError: (err) => {
      toast.error("Error creating user!");
    },
  });
  const onSubmit = (data: CreateUserDTO) => {
    if (isEditing && id) {
      updateUserMutation.mutateAsync(data);
    } else {
      createUserMutation.mutateAsync(data);
    }
  };
  useEffect(() => {
    if (fetchedUserDetail?.data && officeData) {
      const user = fetchedUserDetail?.data;
      console.log({ user });

      const payload = {
        email: user.email,
        full_name: `${user.first_name ?? ""} ${user.last_name ?? ""}`,
        office_id: String(user.office_id?.id),
        phone_number: user.phone_number,
        user_type: user.role?.name as UserType,
      };
      console.log({ payload });

      form.reset(payload);
    }
  }, [fetchedUserDetail, officeData]);
  console.log({ userValues: form.watch() });

  if (isEditing && (!fetchedUserDetail || isLoading)) {
    return <Loading />;
  }
  return (
    <Card className="shadow-xl">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Create User Account
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new user to the system
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Hari Bahadur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., someone@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+977 9xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="office_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        defaultValue={String(field.value)}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger
                          className={`${
                            form.formState.errors.office_id
                              ? "border-destructive"
                              : ""
                          } w-full`}
                        >
                          <SelectValue placeholder="Select Office" />
                        </SelectTrigger>
                        <SelectContent>
                          {officeData.map((office: any) => (
                            <SelectItem
                              key={office.value}
                              value={office.value.toString()}
                            >
                              {office?.label ?? ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="user_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Type</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        defaultValue={String(field.value)}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger
                          className={`${
                            form.formState.errors.user_type
                              ? "border-destructive"
                              : ""
                          } w-full`}
                        >
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {userTypeOptions.map((type: any) => (
                            <SelectItem
                              key={type.value.toString()}
                              value={type.value.toString()}
                            >
                              {type?.label ?? ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isEditing ? "Update" : "Create"} User
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}
