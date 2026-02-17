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
import { mutateProtectedHandler } from "@/core/services/apiHandler/mutateHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProductionCapacityFormProps {
  onClose: () => void;
}

export default function ProductionCapacityForm({
  onClose,
}: ProductionCapacityFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<CreateProductionCapacityDTO>({
    defaultValues: {
      capacity_name: "",
    },
    resolver: zodResolver(CreateProductionCapacitySchema),
  });
  console.log({ provinceData: form.watch() });

  const createAnimalCategoryMutation = useMutation({
    mutationFn: (payload: CreateProductionCapacityDTO) =>
      mutateProtectedHandler(endpoints.production_capacity, payload),
    onSuccess: (res) => {
      console.log("error...", { res });
      queryClient.invalidateQueries({
        queryKey: ["production-capacity"],
      });
      toast.success("Production Capacity  created successfully!");
      onClose();
    },
    onError: (err) => {
      console.log("error...", { err });

      toast.error("Error creating production capacity!");
    },
  });
  const onSubmit = (data: CreateProductionCapacityDTO) => {
    console.log({ data });
    createAnimalCategoryMutation.mutateAsync(data);
  };
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
                onClick={onClose}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Create Production Capacity
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}
