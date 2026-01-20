"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormSection from "@/components/form/form-section";
import { useToast } from "@/components/ui/use-toast";
import { IUser } from "@/core/interfaces/user.interface";

interface CattleEntry {
  id: string;
  category: string;
  animalType: string;
  numberOfAnimals: number;
  age: string;
  ageUnit: string;
  fmdStatus: boolean;
  tagNumber: string;
  productionCapacity: string;
  tagImage: File | null;
}

interface TaggingFormProps {
  user: IUser;
}

const ANIMAL_TYPES = ["Cow", "Buffalo", "Goat", "Sheep", "Others"];
const PRODUCTION_TYPES = ["Milk", "Meat", "Both"];

export default function TaggingForm({ user }: TaggingFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    localLevelName: "",
    province: user.office_id.province_id.province_name || "",
    district: user.office_id.district_id.district_name || "",
    ruralMunicipality: "",
    date: new Date().toISOString().split("T")[0],
    serialNumber: "SN-" + Date.now(),
    ownerName: "",
    contactNumber: "",
    latitude: "27.7172",
    longitude: "85.3240",
  });

  const [cattleEntries, setCattleEntries] = useState<CattleEntry[]>([
    {
      id: "cattle-1",
      category: "",
      animalType: "",
      numberOfAnimals: 1,
      age: "",
      ageUnit: "year",
      fmdStatus: false,
      tagNumber: "",
      productionCapacity: "",
      tagImage: null,
    },
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.ownerName.trim())
      newErrors.ownerName = "Owner name is required";
    if (!formData.contactNumber.trim())
      newErrors.contactNumber = "Contact number is required";

    cattleEntries.forEach((cattle, idx) => {
      if (!cattle.animalType)
        newErrors[`cattle-${idx}-animalType`] = "Animal type is required";
      if (cattle.numberOfAnimals < 1)
        newErrors[`cattle-${idx}-numberOfAnimals`] =
          "Must have at least 1 animal";
      if (!cattle.tagNumber.trim())
        newErrors[`cattle-${idx}-tagNumber`] = "Tag number is required";
      if (!cattle.productionCapacity)
        newErrors[`cattle-${idx}-productionCapacity`] =
          "Production capacity is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCattle = () => {
    const newCattleId = "cattle-" + Date.now();
    setCattleEntries([
      ...cattleEntries,
      {
        id: newCattleId,
        category: "",
        animalType: "",
        numberOfAnimals: 1,
        age: "",
        ageUnit: "year",
        fmdStatus: false,
        tagNumber: "",
        productionCapacity: "",
        tagImage: null,
      },
    ]);
  };

  const handleRemoveCattle = (id: string) => {
    if (cattleEntries.length > 1) {
      setCattleEntries(cattleEntries.filter((c) => c.id !== id));
    }
  };

  const updateCattleEntry = (id: string, updates: Partial<CattleEntry>) => {
    setCattleEntries(
      cattleEntries.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success!",
        description: `Entry with ${cattleEntries.length} cattle record(s) has been submitted successfully.`,
      });

      // Reset form
      if (formRef.current) {
        formRef.current.reset();
      }
      setFormData({
        localLevelName: "",
        ruralMunicipality: "",
        district: "",
        province: "",

        date: new Date().toISOString().split("T")[0],
        serialNumber: "SN-" + Date.now(),
        ownerName: "",
        contactNumber: "",
        latitude: "27.7172",
        longitude: "85.3240",
      });
      setCattleEntries([
        {
          id: "cattle-1",
          category: "",
          animalType: "",
          numberOfAnimals: 1,
          age: "",
          ageUnit: "year",
          fmdStatus: false,
          tagNumber: "",
          productionCapacity: "",
          tagImage: null,
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Section A: Location & Meta Info */}
      <FormSection title="Location & Meta Information" icon="📍">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Local Level Name
            </label>
            <Input
              placeholder="Enter local level name"
              value={formData.localLevelName}
              onChange={(e) =>
                setFormData({ ...formData, localLevelName: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Province
            </label>
            <Input disabled value={formData.province} className="bg-muted" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              District
            </label>
            <Input disabled value={formData.district} className="bg-muted" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Rural/Municipality
            </label>
            <Input
              placeholder="Enter rural/municipality name"
              value={formData.ruralMunicipality}
              onChange={(e) =>
                setFormData({ ...formData, ruralMunicipality: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Date
            </label>
            <Input
              type="date"
              disabled
              value={formData.date}
              className="bg-muted"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Serial Number
            </label>
            <Input
              disabled
              value={formData.serialNumber}
              className="bg-muted"
            />
          </div>
        </div>
      </FormSection>

      {/* Section B: Owner Details */}
      <FormSection title="Owner Details" icon="👤">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Owner's Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter owner's name"
              value={formData.ownerName}
              onChange={(e) =>
                setFormData({ ...formData, ownerName: e.target.value })
              }
              className={errors.ownerName ? "border-destructive" : ""}
            />
            {errors.ownerName && (
              <p className="text-xs text-destructive mt-1">
                {errors.ownerName}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Contact Number <span className="text-destructive">*</span>
            </label>
            <Input
              type="tel"
              placeholder="+977-9800000000"
              value={formData.contactNumber}
              onChange={(e) =>
                setFormData({ ...formData, contactNumber: e.target.value })
              }
              className={errors.contactNumber ? "border-destructive" : ""}
            />
            {errors.contactNumber && (
              <p className="text-xs text-destructive mt-1">
                {errors.contactNumber}
              </p>
            )}
          </div>
        </div>
      </FormSection>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Cattle Details & Vaccination
          </h3>
          <Button
            type="button"
            onClick={handleAddCattle}
            variant="outline"
            className="text-sm bg-transparent"
          >
            + Add Another Cattle
          </Button>
        </div>

        {cattleEntries.map((cattle, idx) => (
          <div
            key={cattle.id}
            className="border border-border rounded-lg p-4 sm:p-6 space-y-4 bg-card"
          >
            {/* Cattle Card Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-foreground">
                Cattle #{idx + 1}
              </h4>
              {cattleEntries.length > 1 && (
                <Button
                  type="button"
                  onClick={() => handleRemoveCattle(cattle.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cattle Category */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Cattle Category
                </label>
                <Input
                  placeholder="e.g., Indigenous, Crossbred"
                  value={cattle.category}
                  onChange={(e) =>
                    updateCattleEntry(cattle.id, { category: e.target.value })
                  }
                />
              </div>

              {/* Animal Type */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Animal Type <span className="text-destructive">*</span>
                </label>
                <Select
                  value={cattle.animalType}
                  onValueChange={(value) =>
                    updateCattleEntry(cattle.id, { animalType: value })
                  }
                >
                  <SelectTrigger
                    className={
                      errors[`cattle-${idx}-animalType`]
                        ? "border-destructive"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select animal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANIMAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`cattle-${idx}-animalType`] && (
                  <p className="text-xs text-destructive mt-1">
                    {errors[`cattle-${idx}-animalType`]}
                  </p>
                )}
              </div>

              {/* Number of Animals */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Number of Animals <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter number"
                  value={cattle.numberOfAnimals}
                  onChange={(e) =>
                    updateCattleEntry(cattle.id, {
                      numberOfAnimals: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  className={
                    errors[`cattle-${idx}-numberOfAnimals`]
                      ? "border-destructive"
                      : ""
                  }
                />
                {errors[`cattle-${idx}-numberOfAnimals`] && (
                  <p className="text-xs text-destructive mt-1">
                    {errors[`cattle-${idx}-numberOfAnimals`]}
                  </p>
                )}
              </div>

              {/* Animal Age */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Animal Age
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Age"
                    value={cattle.age}
                    onChange={(e) =>
                      updateCattleEntry(cattle.id, { age: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Select
                    value={cattle.ageUnit}
                    onValueChange={(value) =>
                      updateCattleEntry(cattle.id, { ageUnit: value })
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* FMD Vaccine Status */}
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cattle.fmdStatus}
                    onChange={(e) =>
                      updateCattleEntry(cattle.id, {
                        fmdStatus: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">
                    FMD Vaccine Applied
                  </span>
                </label>
              </div>

              {/* Tag Number */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Tag Number <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., TAG-001-2024"
                  value={cattle.tagNumber}
                  onChange={(e) =>
                    updateCattleEntry(cattle.id, { tagNumber: e.target.value })
                  }
                  className={
                    errors[`cattle-${idx}-tagNumber`]
                      ? "border-destructive"
                      : ""
                  }
                />
                {errors[`cattle-${idx}-tagNumber`] && (
                  <p className="text-xs text-destructive mt-1">
                    {errors[`cattle-${idx}-tagNumber`]}
                  </p>
                )}
              </div>

              {/* Production Capacity */}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Production Capacity{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Select
                  value={cattle.productionCapacity}
                  onValueChange={(value) =>
                    updateCattleEntry(cattle.id, { productionCapacity: value })
                  }
                >
                  <SelectTrigger
                    className={
                      errors[`cattle-${idx}-productionCapacity`]
                        ? "border-destructive"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`cattle-${idx}-productionCapacity`] && (
                  <p className="text-xs text-destructive mt-1">
                    {errors[`cattle-${idx}-productionCapacity`]}
                  </p>
                )}
              </div>

              {/* Tag Image Upload */}
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Tag Image
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-secondary/50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateCattleEntry(cattle.id, { tagImage: file });
                      }
                    }}
                    className="hidden"
                    id={`tag-image-${cattle.id}`}
                  />
                  <label
                    htmlFor={`tag-image-${cattle.id}`}
                    className="cursor-pointer block"
                  >
                    {cattle.tagImage ? (
                      <div className="text-sm text-foreground">
                        <p className="font-medium">
                          File selected: {cattle.tagImage.name}
                        </p>
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section G: GPS Auto Capture */}
      <FormSection title="Location Coordinates" icon="🗺️">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Latitude
            </label>
            <Input disabled value={formData.latitude} className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">Auto-captured</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Longitude
            </label>
            <Input disabled value={formData.longitude} className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">Auto-captured</p>
          </div>
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
            : `Submit Entry (${cattleEntries.length} cattle)`}
        </Button>
      </div>
    </form>
  );
}
