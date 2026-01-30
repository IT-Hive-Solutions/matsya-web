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
import { useEffect, useState } from "react";

import { endpoints } from "@/core/contants/endpoints";
import { CreateOfficeDTO, CreateOfficeSchema } from "@/core/dtos/office.dto";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { mutateProtectedHandler } from "@/core/services/apiHandler/mutateHandler";
import { toast } from "sonner";

interface OfficeFormProps {
  onClose: () => void;
}

export default function OfficeForm({ onClose }: OfficeFormProps) {
  const [districtData, setDistrictData] = useState([]);
  const [provinceData, setProvinceData] = useState([]);

  const queryClient = useQueryClient();
  const form = useForm<CreateOfficeDTO>({
    defaultValues: {
      district_id: undefined,
      mun_id: undefined,
      office_name: "",
      office_email: "",
      office_contact: "",
      province_id: undefined,
      ward_number: undefined,
    },
    resolver: zodResolver(CreateOfficeSchema),
  });
  console.log({ provinceData: form.watch() });

  const { data: districtFetched } = useQuery({
    queryKey: ["district"],
    queryFn: () => fetchProtectedHandler(endpoints.district),
  });
  const { data: provinceFetched } = useQuery({
    queryKey: ["province"],
    queryFn: () => fetchProtectedHandler(endpoints.province),
  });

  useEffect(() => {
    if (districtFetched) {
      const data = districtFetched?.data?.map((p: any) => ({
        label: p.district_name,
        value: p.id,
      }));
      setDistrictData(data);
    }
  }, [districtFetched]);
  useEffect(() => {
    if (provinceFetched) {
      const data = provinceFetched?.data?.map((p: any) => ({
        label: p?.province_name ?? "",
        value: p.id,
      }));
      setProvinceData(data);
    }
  }, [provinceFetched]);

  const createOfficeMutation = useMutation({
    mutationFn: (payload: CreateOfficeDTO) =>
      mutateProtectedHandler(endpoints.office, payload),
    onSuccess: (res) => {
      console.log("error...", { res });
      queryClient.invalidateQueries({
        queryKey: ["office"],
      });
      toast.success("Office created successfully!");
      onClose();
    },
    onError: (err) => {
      console.log("error...", { err });

      toast.error("Error creating office!");
    },
  });
  const onSubmit = (data: CreateOfficeDTO) => {
    console.log({ data });
    createOfficeMutation.mutateAsync(data);
  };
  return (
    <Card className="shadow-xl">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Create Office
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Register a new livestock office
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
            {/* Office Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Office Name */}
              <FormField
                control={form.control}
                name="office_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., District Veterinary Office"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="office_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Office Email</FormLabel>
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
            {/* Location Section */}
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
              <h4 className="text-sm font-semibold text-foreground mb-4">
                Office Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <FormField
                  control={form.control}
                  name="province_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={field.value?.toString() ?? ""}
                          onValueChange={(val) => field.onChange(parseInt(val))}
                        >
                          <SelectTrigger
                            className={
                              form.formState.errors.province_id
                                ? "border-destructive"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinceData.map((province: any) => (
                              <SelectItem
                                key={province.value}
                                value={province.value.toString()}
                              >
                                {province?.label ?? ""}
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
                  name="district_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={field.value?.toString() ?? ""}
                          onValueChange={(val) => field.onChange(parseInt(val))}
                          disabled={!form.watch("province_id")}
                        >
                          <SelectTrigger
                            className={
                              form.formState.errors.district_id
                                ? "border-destructive"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select district" />
                          </SelectTrigger>
                          <SelectContent>
                            {districtData.map(
                              (district: any, index: number) => (
                                <SelectItem
                                  key={index}
                                  value={district?.value?.toString()}
                                >
                                  {district?.label ?? ""}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="mun_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Municipality</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={field.value?.toString() ?? ""}
                          onValueChange={field.onChange}
                          disabled={!form.watch("district_id")}
                        >
                          <SelectTrigger
                            className={
                              errors.municipality ? "border-destructive" : ""
                            }
                          >
                            <SelectValue placeholder="Select municipality" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.district_id &&
                              MUNICIPALITIES[formData.province_id]?.[
                                formData.district_id
                              ]?.map((mun) => (
                                <SelectItem key={mun} value={mun?.toString()}>
                                  {mun}
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
                  name="mun_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ward Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1-32"
                          min="1"
                          max="33"
                          {...field}
                          className={
                            errors.wardNumber ? "border-destructive" : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
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
