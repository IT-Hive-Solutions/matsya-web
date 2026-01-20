"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endpoints } from "@/core/contants/endpoints";
import { CreateAnimalDTO, CreateAnimalSchema } from "@/core/dtos/animal.dto";
import { monthOptions } from "@/core/enums/month.enum";
import { IAnimalType } from "@/core/interfaces/animalType.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { mutateProtectedHandler } from "@/core/services/apiHandler/mutateHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface AnimalFormProps {
  onClose: () => void;
}

export default function AnimalForm({ onClose }: AnimalFormProps) {
  const [animalTypeOptions, setAnimalTypeOptions] = useState([]);
  const [animalCategoryOptions, setAnimalCategoryOptions] = useState([]);

  const { data: animalTypesFetched } = useQuery({
    queryKey: ["animal-type"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_types),
  });
  const { data: animalCategoryFetched } = useQuery({
    queryKey: ["animal-type"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_types),
  });
  useEffect(() => {
    if (animalTypesFetched?.data) {
      const payload = animalTypesFetched?.data?.map((type: IAnimalType) => {
        return {
          label: type.animal_name,
          value: type.id,
        };
      });
      setAnimalTypeOptions(payload);
    }
  }, [animalTypesFetched]);
  useEffect(() => {
    if (animalCategoryFetched?.data) {
      const payload = animalCategoryFetched?.data?.map((type: IAnimalType) => {
        return {
          label: type.animal_name,
          value: type.id,
        };
      });
      setAnimalCategoryOptions(payload);
    }
  }, [animalCategoryFetched]);

  const queryClient = useQueryClient();
  const form = useForm<CreateAnimalDTO>({
    defaultValues: {
      age_months: undefined,
      age_years: undefined,
      animal_category: undefined,
      animal_type: undefined,
      is_vaccination_applied: "",
      latitude: "",
      longitude: "",
      owners_contact: undefined,
      production_capacity: "",
    },
    resolver: zodResolver(CreateAnimalSchema),
  });
  console.log({ formData: form.watch() });

  const createAnimalMutation = useMutation({
    mutationFn: (payload: CreateAnimalDTO) =>
      mutateProtectedHandler(endpoints.animal_info, payload),
    onSuccess: (res) => {
      console.log("error...", { res });
      queryClient.invalidateQueries({
        queryKey: ["animals"],
      });
      toast.success("Animal created successfully!");
      onClose();
    },
    onError: (err) => {
      console.log("error...", { err });

      toast.error("Error creating animal!");
    },
  });
  const onSubmit = (data: CreateAnimalDTO) => {
    console.log({ data });
    createAnimalMutation.mutateAsync(data);
  };
  return (
    <Card className="shadow-xl">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Create Animal Account
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new animal to the system
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
                name="tag_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tag Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_vaccination_applied"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Vaccination Applied</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Yes/No"
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
                name="owners_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner's Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="9xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="production_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production Capacity</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Total production capacity"
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
                name="age_years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 2022"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Months</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value?.toString() ?? ""}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger
                          className={`${
                            form.formState.errors.age_months
                              ? "border-destructive"
                              : ""
                          } w-full`}
                        >
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {monthOptions.map((type: any) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="animal_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animal Type</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value?.toString() ?? ""}
                        onValueChange={(val) => field.onChange(parseInt(val))}
                      >
                        <SelectTrigger
                          className={`${
                            form.formState.errors.animal_type
                              ? "border-destructive"
                              : ""
                          } w-full`}
                        >
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {animalTypeOptions.map((type: any) => (
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
              <FormField
                control={form.control}
                name="animal_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Animal Category</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={field.value?.toString() ?? ""}
                        onValueChange={(val) => field.onChange(parseInt(val))}
                      >
                        <SelectTrigger
                          className={`${
                            form.formState.errors.animal_category
                              ? "border-destructive"
                              : ""
                          } w-full`}
                        >
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {animalCategoryOptions.map((type: any) => (
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
