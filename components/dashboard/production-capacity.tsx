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
import { endpoints } from "@/core/contants/endpoints";
import {
  CreateProductionCapacityDTO,
  CreateProductionCapacitySchema,
} from "@/core/dtos/production-capacity.dto";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import {
  mutateProtectedHandler,
  updateProtectedHandler,
} from "@/core/services/apiHandler/mutateHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loading from "../loading";

interface ProductionCapacityFormProps {
  onClose: () => void;
  isEditing?: boolean;
  setEditing?: Dispatch<SetStateAction<boolean>>;
}

export default function ProductionCapacityForm({
  onClose,
  isEditing = false,
  setEditing,
}: ProductionCapacityFormProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    const paramsId = searchParams.get("id");
    if (paramsId) {
      const intId = parseInt(paramsId);
      if (!isNaN(intId)) {
        setId(intId);
      }
    }
  }, [searchParams.get("id")]);
  const handleClose = () => {
    form.reset();
    setId(null);
    setEditing && setEditing(false);
    router.replace("/");
    onClose();
  };
  const form = useForm<CreateProductionCapacityDTO>({
    defaultValues: {
      capacity_name: "",
    },
    resolver: zodResolver(CreateProductionCapacitySchema),
  });
  const { data: fetchedProductionCapacityDetail, isLoading } = useQuery({
    queryKey: ["production-capacity-single", id],
    queryFn: () =>
      fetchProtectedHandler(endpoints.production_capacity.byId(id ?? -1)),
    enabled: !!id && isEditing,
  });
  const createAnimalCategoryMutation = useMutation({
    mutationFn: (payload: CreateProductionCapacityDTO) =>
      mutateProtectedHandler(endpoints.production_capacity, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["production-capacity"],
      });
      toast.success("Production Capacity  created successfully!");
      handleClose();
    },
    onError: (err) => {
      toast.error("Error creating production capacity!");
    },
  });
  const updateAnimalCategoryMutation = useMutation({
    mutationFn: (payload: CreateProductionCapacityDTO) =>
      updateProtectedHandler(
        endpoints.production_capacity.byId(id ?? -1),
        payload,
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["production-capacity"],
      });
      toast.success("Production Capacity  created successfully!");
      handleClose();
    },
    onError: (err) => {
      toast.error("Error creating production capacity!");
    },
  });

  const onSubmit = (data: CreateProductionCapacityDTO) => {
    if (isEditing && id) {
      updateAnimalCategoryMutation.mutateAsync(data);
    } else {
      createAnimalCategoryMutation.mutateAsync(data);
    }
  };

  useEffect(() => {
    if (fetchedProductionCapacityDetail?.data) {
      form.reset(fetchedProductionCapacityDetail?.data);
    }
  }, [fetchedProductionCapacityDetail]);

  if (isEditing && (!fetchedProductionCapacityDetail || isLoading)) {
    return <Loading />;
  }
  return (
    <Card className="shadow-xl">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Create Production Capacity
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new production capacity
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
            {/* Production Capacity  Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Production Capacity  Name */}
              <FormField
                control={form.control}
                name="capacity_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Production Capacity Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Milk " {...field} />
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
                {isEditing ? "Update" : "Create"} Production Capacity
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}
