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
  CreateAnimaTypeDTO,
  CreateAnimaTypeSchema,
} from "@/core/dtos/animal-type.dto";
import { fetchHandler } from "@/core/services/apiHandler/fetchHandler";
import {
  mutateHandler,
  updateHandler,
} from "@/core/services/apiHandler/mutateHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Loading from "../loading";
import { IAnimalType } from "@/core/interfaces/animalType.interface";
import { directusEndpoints } from "@/core/contants/directusEndpoints";

interface AnimalTypeFormProps {
  onClose: () => void;
  isEditing?: boolean;
  setEditing?: Dispatch<SetStateAction<boolean>>;
}

export default function AnimalTypeForm({
  onClose,
  isEditing = false,
  setEditing,
}: AnimalTypeFormProps) {
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
  const form = useForm<CreateAnimaTypeDTO>({
    defaultValues: {
      animal_name: "",
    },
    resolver: zodResolver(CreateAnimaTypeSchema),
  });
  const { data: fetchedAnimalTypesDetail, isLoading } = useQuery({
    queryKey: ["animal-type-single", id],
    queryFn: () =>
      fetchHandler<IAnimalType>(directusEndpoints.animal_types.byId(id ?? -1)),
    enabled: !!id && isEditing,
  });

  const handleClose = () => {
    form.reset();
    setId(null);
    setEditing && setEditing(false);
    router.replace("/");
    onClose();
  };

  const createAnimalTypeMutation = useMutation({
    mutationFn: (payload: CreateAnimaTypeDTO) =>
      mutateHandler(directusEndpoints.animal_types, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["animal-type"],
      });
      toast.success("Animal category  created successfully!");
      handleClose();
    },
    onError: (err) => {
      toast.error("Error creating animal category!");
    },
  });

  const updateAnimalTypeMutation = useMutation({
    mutationFn: (payload: CreateAnimaTypeDTO) =>
      updateHandler(directusEndpoints.animal_types.byId(id ?? -1), payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ["animal-type"],
      });
      toast.success("Animal category  udpated successfully!");
      handleClose();
    },
    onError: (err) => {
      toast.error("Error updating animal category!");
    },
  });

  const onSubmit = (data: CreateAnimaTypeDTO) => {
    if (isEditing && id) {
      updateAnimalTypeMutation.mutateAsync(data);
    } else {
      createAnimalTypeMutation.mutateAsync(data);
    }
  };

  useEffect(() => {
    if (fetchedAnimalTypesDetail?.data) {
      form.reset(fetchedAnimalTypesDetail?.data);
    }
  }, [fetchedAnimalTypesDetail]);

  if (isEditing && (!fetchedAnimalTypesDetail || isLoading)) {
    return <Loading />;
  }
  return (
    <Card className="shadow-xl">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              Create Animal Category
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new livestock type
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
            {/* Animal Category  Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Animal Category  Name */}
              <FormField
                control={form.control}
                name="animal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Livestock Type Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cow " {...field} />
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
                {isEditing ? "Update" : "Create"} Animal Type
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}
