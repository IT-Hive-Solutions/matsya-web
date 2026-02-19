"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import FormSection from "@/components/form/form-section";
import { useToast } from "@/components/ui/use-toast";
import { IUser } from "@/core/interfaces/user.interface";
import { CreateAnimalSchema } from "@/core/dtos/animal.dto";
import { monthOptions } from "@/core/enums/month.enum";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHandler } from "@/core/services/apiHandler/fetchHandler";
import { endpoints } from "@/core/contants/endpoints";
import { IAnimalType } from "@/core/interfaces/animalType.interface";
import { IProductionCapacity } from "@/core/interfaces/productionCapacity.interface";
import { IAnimalCategories } from "@/core/interfaces/animalCategory.interface";
import { mutateHandler } from "@/core/services/apiHandler/mutateHandler";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { directusEndpoints } from "@/core/contants/directusEndpoints";

interface TaggingFormProps {
  user: IUser;
}

const formSchema = z.object({
  localLevelName: z.string().optional(),
  province_id: z.string(),
  district_id: z.string(),
  municipality: z.string().optional(),
  date: z.string(),
  serial_number: z.string(),
  owners_name: z.string().min(1, "Owner name is required"),
  owners_contact: z.string().min(1, "Contact number is required"),
  latitude: z.string(),
  longitude: z.string(),
  cattleEntries: z
    .array(CreateAnimalSchema)
    .min(1, "At least one cattle entry is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TaggingForm({ user }: TaggingFormProps) {
  const queryClient = useQueryClient();

  const [uploadingImages, setUploadingImages] = useState<
    Record<number, boolean>
  >({});
  const [imagePreview, setImagePreview] = useState<Record<number, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animalTypeOptions, setAnimalTypeOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [productionCapacityOptions, setProductionCapacityOptions] = useState<
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

  const { data: productionCapacityFetched } = useQuery({
    queryKey: ["production-types"],
    queryFn: () =>
      fetchHandler<IProductionCapacity[]>(
        directusEndpoints.production_capacity,
      ),
  });
  const { data: animalTypesFetched } = useQuery({
    queryKey: ["animal-type"],
    queryFn: () => fetchHandler<IAnimalType[]>(directusEndpoints.animal_types),
  });
  const { data: animalCategoryFetched } = useQuery({
    queryKey: ["animal-category"],
    queryFn: () =>
      fetchHandler<IAnimalCategories[]>(directusEndpoints.animal_category),
  });

  useEffect(() => {
    if (productionCapacityFetched?.data) {
      const payload = productionCapacityFetched?.data?.map(
        (type: IProductionCapacity) => {
          return {
            label: type.capacity_name,
            value: String(type.id),
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
          value: String(type.id),
        };
      });
      setAnimalTypeOptions(payload);
    }
  }, [animalTypesFetched]);
  useEffect(() => {
    if (animalCategoryFetched?.data) {
      const payload = animalCategoryFetched?.data?.map(
        (type: IAnimalCategories) => {
          return {
            label: type.category_name,
            value: String(type.id),
          };
        },
      );
      setAnimalCategoryOptions(payload);
    }
  }, [animalCategoryFetched]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      localLevelName: "",
      province_id:
        user.office_id?.district_id?.province_id?.province_name || "",
      district_id: String(user.office_id?.district_id?.id) || "",
      municipality: "",
      date: new Date().toISOString().split("T")[0],
      serial_number: "SN-" + Date.now(),
      owners_name: "",
      owners_contact: "",
      latitude: "27.7172",
      longitude: "85.3240",
      cattleEntries: [
        {
          animal_category: undefined,
          animal_type: undefined,
          age_months: undefined,
          age_years: undefined,
          is_vaccination_applied: false,
          latitude: undefined,
          longitude: undefined,
          owners_contact: undefined,
          production_capacity: undefined,
          tag_number: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cattleEntries",
  });

  const handleAddLivestock = () => {
    append({
      animal_category: undefined,
      animal_type: undefined,
      age_months: undefined,
      age_years: undefined,
      is_vaccination_applied: false,
      latitude: undefined,
      longitude: undefined,
      owners_contact: undefined,
      production_capacity: undefined,
      tag_number: undefined,
    });
  };

  const handleRemoveLivestock = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleImageUpload = async (file: File, index: number) => {
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    try {
      setUploadingImages((prev) => ({ ...prev, [index]: true }));

      // Create FormData
      const formData = new FormData();
      formData.append("image", file);

      // Upload image
      const response = await fetch("/api/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();

      // Assuming the API returns { image_id: "some-id" } or { id: "some-id" }
      const imageId = data.fileId || data?.data?.id;

      if (!imageId) {
        throw new Error("No image ID returned from server");
      }

      // Update form with image ID
      form.setValue(`cattleEntries.${index}.tag_image`, imageId);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview((prev) => ({ ...prev, [index]: previewUrl }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Remove image handler
  const handleRemoveImage = (index: number) => {
    form.setValue(`cattleEntries.${index}.tag_image`, undefined);

    // Clean up preview URL
    if (imagePreview[index]) {
      URL.revokeObjectURL(imagePreview[index]);
      const newPreviews = { ...imagePreview };
      delete newPreviews[index];
      setImagePreview(newPreviews);
    }
  };

  const createAnimalMutation = useMutation({
    mutationFn: (payload: FormValues) =>
      mutateHandler(endpoints.animal_info["create-multiple"], payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["animals"],
      });
      toast.success("Animal created successfully!");
      // onClose();
      form.reset();
      Object.values(imagePreview).forEach((url) => {
        URL.revokeObjectURL(url);
      });
      setImagePreview({});
    },
    onError: (err) => {
      toast.error("Error creating animal!");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: FormValues) => {
    await createAnimalMutation.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section A: Location & Meta Info */}
        <FormSection title="Location & Meta Information" icon="📍">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="localLevelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local Level Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter local level name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <FormControl>
                    <Input disabled className="bg-muted" {...field} />
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
                    <Input disabled className="bg-muted" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rural/Municipality</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter rural/municipality name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled
                      className="bg-muted"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serial_number"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input disabled className="bg-muted" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>
        {/* Section B: Owner Details */}
        <FormSection title="Owner Details" icon="👤">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="owners_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Owner's Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter owner's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="owners_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contact Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="9800000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>
        {/* Livestock Details Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Livestock Details & Vaccination
            </h3>
            <Button
              type="button"
              onClick={handleAddLivestock}
              variant="outline"
              className="text-sm bg-transparent"
            >
              + Add Another Livestock
            </Button>
          </div>

          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="border border-border rounded-lg p-4 sm:p-6 space-y-4 bg-card"
            >
              {/* Livestock Card Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-semibold text-foreground">
                  Livestock #{idx + 1}
                </h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveLivestock(idx)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`cattleEntries.${idx}.animal_category`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Animal Category{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        {...field}
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        value={field.value?.toString() ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select animal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {animalCategoryOptions.map((type) => (
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

                <FormField
                  control={form.control}
                  name={`cattleEntries.${idx}.animal_type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Animal Type <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        {...field}
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        value={field.value?.toString() ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select animal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {animalTypeOptions.map((type) => (
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

                <FormField
                  control={form.control}
                  name={`cattleEntries.${idx}.num_of_animals`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Number of Animals{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                          value={"1"}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex item-center gap-3">
                  <FormField
                    control={form.control}
                    name={`cattleEntries.${idx}.age_years`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (Years)</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Age in Years"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                              className="flex-1"
                              min={0}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`cattleEntries.${idx}.age_months`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (Months)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Age in Months"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            className="flex-1"
                            min={0}
                            max={11}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`cattleEntries.${idx}.is_vaccination_applied`}
                  render={({ field }) => (
                    <FormItem className="flex items-end space-y-0">
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="mt-0! cursor-pointer">
                          FMD Vaccine Applied
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`cattleEntries.${idx}.tag_number`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tag Number <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., TAG-001-2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`cattleEntries.${idx}.production_capacity`}
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

                <FormField
                  control={form.control}
                  name={`cattleEntries.${idx}.tag_image`}
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Tag Image</FormLabel>
                      <FormControl>
                        <div>
                          {/* Image Preview */}
                          {imagePreview[idx] && (
                            <div className="mb-3 relative inline-block">
                              <img
                                src={imagePreview[idx]}
                                alt="Tag preview"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={() => handleRemoveImage(idx)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {/* Upload Area */}
                          {!imagePreview[idx] && (
                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-secondary/50 transition">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, idx);
                                  }
                                }}
                                className="hidden"
                                id={`tag-image-${idx}`}
                                disabled={uploadingImages[idx]}
                                {...field}
                              />
                              <label
                                htmlFor={`tag-image-${idx}`}
                                className="cursor-pointer block"
                              >
                                {uploadingImages[idx] ? (
                                  <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Uploading...</span>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      Click to upload tag image
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      PNG, JPG up to 5MB
                                    </p>
                                  </div>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
        Section G: GPS Auto Capture
        <FormSection title="Location Coordinates" icon="🗺️">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input disabled className="bg-muted" {...field} />
                  </FormControl>
                  <FormDescription>Auto-captured</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input disabled className="bg-muted" {...field} />
                  </FormControl>
                  <FormDescription>Auto-captured</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>
        {/* Submit Button */}
        <div className="flex gap-3 sticky bottom-0 bg-background border-t border-border p-4 -m-6 mt-0 rounded-lg">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isSubmitting
              ? "Submitting..."
              : `Submit Entry (${fields.length} cattle)`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
