"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import { mutateProtectedHandler } from "@/core/services/apiHandler/mutateHandler";
import { endpoints } from "@/core/contants/endpoints";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
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
import { userTypeOptions } from "@/core/interfaces/user.interface";

interface UserFormProps {
  onClose: () => void;
}

export default function UserForm({ onClose }: UserFormProps) {
  const [officeData, setOfficeData] = useState([]);

  const queryClient = useQueryClient();
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
  console.log({ formData: form.watch() });

  const { data: officeFetched } = useQuery({
    queryKey: ["office"],
    queryFn: () => fetchProtectedHandler(endpoints.office),
  });
  useEffect(() => {
    if (officeFetched?.data) {
      const data = officeFetched?.data?.map((p: any) => ({
        label: p.office_name,
        value: p.id,
      }));
      setOfficeData(data);
    }
  }, [officeFetched]);

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserDTO) =>
      mutateProtectedHandler(endpoints.users, payload),
    onSuccess: (res) => {
      console.log("error...", { res });
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast.success("User created successfully!");
      onClose();
    },
    onError: (err) => {
      console.log("error...", { err });

      toast.error("Error creating user!");
    },
  });
  const onSubmit = (data: CreateUserDTO) => {
    console.log({ data });
    createUserMutation.mutateAsync(data);
  };
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
            onClick={onClose}
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
                        value={field.value?.toString() ?? ""}
                        onValueChange={(val) => field.onChange(parseInt(val))}
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
                        value={field.value?.toString() ?? ""}
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
                onClick={onClose}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Create Office
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}
