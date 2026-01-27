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
import {
  CreateAnimalDTO,
  CreateAnimalSchema,
  UpdateAnimalDTO,
} from "@/core/dtos/animal.dto";
import { monthOptions } from "@/core/enums/month.enum";
import { IAnimalType } from "@/core/interfaces/animalType.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import {
  mutateProtectedHandler,
  updateProtectedHandler,
} from "@/core/services/apiHandler/mutateHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { IProductionCapacity } from "@/core/interfaces/productionCapacity.interface";
import { formatDateWithHyphen } from "@/core/services/dateTime/formatDate";
import { IAnimalCategories } from "@/core/interfaces/animalCategory.interface";

interface AnimalFormProps {
  onClose: () => void;
  animalId?: number;
}

export default function AnimalForm({ onClose, animalId }: AnimalFormProps) {
  const [productionCapacityOptions, setProductionCapacityOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [animalTypeOptions, setAnimalTypeOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [animalCategoryOptions, setAnimalCategoryOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const { data: fetchedAnimalData } = useQuery({
    queryKey: ["animal"],
    queryFn: () =>
      fetchProtectedHandler(endpoints.animal_info.byId(animalId ?? -1)),
    enabled: !!animalId,
  });
  const { data: productionCapacityFetched } = useQuery({
    queryKey: ["production-types"],
    queryFn: () => fetchProtectedHandler(endpoints.production_capacity),
  });
  const { data: animalTypesFetched } = useQuery({
    queryKey: ["animal-type"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_types),
  });
  const { data: animalCategoryFetched } = useQuery({
    queryKey: ["animal-category"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_category),
  });

  useEffect(() => {
    const data = fetchedAnimalData?.data;
    if (data) {
      const payload: UpdateAnimalDTO = {
        age_months: data?.age_months,
        age_years: data?.age_years,
        animal_type: data?.animal_type?.id,
        animal_category: data?.animal_category?.id,
        is_vaccination_applied: data?.is_vaccination_applied,
        latitude: data?.latitude,
        longitude: data?.longitude,
        num_of_animals: data?.num_of_animals,
        production_capacity: parseInt(data?.production_capacity),
        tag_number: data?.tag_number,
        owners_contact: data?.owners_id?.owners_contact,
        vaccinated_date: data?.vaccinated_date,
      };
      console.log({ fetchedData: data });

      form.reset(payload);
    }
  }, [fetchedAnimalData]);
  useEffect(() => {
    if (productionCapacityFetched?.data) {
      const payload = productionCapacityFetched?.data?.map(
        (type: IProductionCapacity) => {
          return {
            label: type.capacity_name,
            value: type.id,
          };
        },
      );
      setProductionCapacityOptions(payload);
    }
  }, [productionCapacityFetched]);
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
      const payload = animalCategoryFetched?.data?.map((type: IAnimalCategories) => {
        return {
          label: type.category_name,
          value: type.id,
        };
      });
      setAnimalCategoryOptions(payload);
    }
  }, [animalCategoryFetched]);

  const queryClient = useQueryClient();
  const form = useForm<CreateAnimalDTO | UpdateAnimalDTO>({
    defaultValues: {
      age_months: undefined,
      age_years: undefined,
      animal_category: undefined,
      animal_type: undefined,
      is_vaccination_applied: false,
      latitude: undefined,
      longitude: undefined,
      owners_contact: undefined,
      production_capacity: undefined,
    },
    resolver: zodResolver(CreateAnimalSchema),
    reValidateMode: "onChange",
  });
  console.log({ formData: form.watch() });
  console.log({ errors: form.formState.errors });

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
  const updateAnimalMutation = useMutation({
    mutationFn: (payload: UpdateAnimalDTO) =>
      updateProtectedHandler(
        endpoints.animal_info.byId(animalId ?? -1),
        payload,
      ),
    onSuccess: (res) => {
      console.log("error...", { res });
      queryClient.invalidateQueries({
        queryKey: ["animals"],
      });
      toast.success("Animal updated successfully!");
      onClose();
    },
    onError: (err) => {
      console.log("error...", { err });

      toast.error("Error updating animal!");
    },
  });
  const onSubmit = (data: CreateAnimalDTO | UpdateAnimalDTO) => {
    console.log({ data });
    if (animalId) {
      updateAnimalMutation.mutateAsync(data as UpdateAnimalDTO);
    } else {
      createAnimalMutation.mutateAsync(data as CreateAnimalDTO);
    }
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
                name="num_of_animals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Animals</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        value={String(field.value)}
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
                name={"is_vaccination_applied"}
                render={({ field }) => (
                  <FormItem className="flex items-end space-y-0">
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              form.setValue(
                                "vaccinated_date",
                                formatDateWithHyphen(new Date().toString()),
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="mt-0! cursor-pointer">
                        FMD Vaccine Applied
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {form.watch("is_vaccination_applied") === true && (
                <FormField
                  control={form.control}
                  name={"vaccinated_date"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mt-0! cursor-pointer">
                        Vaccination applied date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="data"
                          {...field}
                          value={field.value}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
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
                name={`production_capacity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Production Capacity{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select capacity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productionCapacityOptions.map((type) => (
                          <SelectItem
                            key={type.value.toString()}
                            value={type.value.toString()}
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
