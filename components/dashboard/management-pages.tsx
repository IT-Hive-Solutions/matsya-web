"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import OfficeLists from "../view/OfficeLists";
import OfficeForm from "./office-form";
import UserForm from "./user-form";
import UserLists from "../view/UsersList";
import { Input } from "../ui/input";
import AnimalCategoriesLists from "../view/AnimalCategoriesList";
import AnimalCategoryForm from "./animal-category-form";
import AnimalLists from "../view/AnimalLists";
import AnimalForm from "./animal-form";
import AnimalTypesLists from "../view/AnimalTypeList";
import AnimalTypeForm from "./animal-type-form";
import ProductionCapacityLists from "../view/ProductionCapacityList";
import ProductionCapacityForm from "./production-capacity";

interface ManagementPageProps {
  type:
    | "livestock"
    | "livestock-category"
    | "livestock-type"
    | "user-accounts"
    | "offices"
    | "production-capacity";
}
export interface Config {
  title: string;
  description: string;
  fields: {
    name: string;
    label: string;
    placeholder: string;
  }[];
}

export default function ManagementPage({ type }: ManagementPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setEditing] = useState<boolean>(false);
  const config: {
    [key: string]: Config;
  } = {
    livestock: {
      title: "Manage Livestock",
      description: "Add and manage livestock types in your system",
      fields: [
        {
          name: "name",
          label: "Animal Name",
          placeholder: "e.g., Animal, Goat, Sheep",
        },
        {
          name: "scientificName",
          label: "Scientific Name",
          placeholder: "e.g., Bos indicus",
        },
        {
          name: "description",
          label: "Description",
          placeholder: "Brief description",
        },
      ],
    },
    "livestock-category": {
      title: "Livestock Categories",
      description: "Create and manage livestock breed categories",
      fields: [
        {
          name: "name",
          label: "Category Name",
          placeholder: "e.g., Dairy, Beef, Dual-purpose",
        },
        {
          name: "breed",
          label: "Breed",
          placeholder: "e.g., Holstein, Jersey",
        },
        {
          name: "productionType",
          label: "Production Type",
          placeholder: "e.g., High milk yield",
        },
      ],
    },
    "livestock-type": {
      title: "Livestock Type",
      description: "Create and manage livestock types",
      fields: [
        {
          name: "animal_name",
          label: "Type",
          placeholder: "e.g., Dairy, Beef, Dual-purpose",
        },
      ],
    },
    "user-accounts": {
      title: "Manage User Accounts",
      description: "Create and manage system user accounts",
      fields: [],
    },
    offices: {
      title: "Create Office",
      description: "Register and manage livestock offices",
      fields: [],
    },
    "production-capacity": {
      title: "Create Production Capacity",
      description: "Create and manage production capacity",
      fields: [],
    },
  };

  const currentConfig = config[type];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {currentConfig?.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {currentConfig.description}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 sm:gap-2 w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Add New</span>
        </Button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            {type === "user-accounts" && (
              <UserForm
                onClose={() => setShowForm(false)}
                isEditing={isEditing}
                setEditing={setEditing}
              />
            )}
            {type === "offices" && (
              <OfficeForm onClose={() => setShowForm(false)} />
            )}
            {type === "livestock-category" && (
              <AnimalCategoryForm
                onClose={() => setShowForm(false)}
                isEditing={isEditing}
                setEditing={setEditing}
              />
            )}
            {type === "livestock-type" && (
              <AnimalTypeForm
                onClose={() => setShowForm(false)}
                isEditing={isEditing}
                setEditing={setEditing}
              />
            )}
            {type === "livestock" && (
              <AnimalForm onClose={() => setShowForm(false)} />
            )}
            {type === "production-capacity" && (
              <ProductionCapacityForm
                onClose={() => setShowForm(false)}
                isEditing={isEditing}
                setEditing={setEditing}
              />
            )}
          </div>
        </div>
      )}

      {type === "offices" && (
        <OfficeLists currentConfig={currentConfig} setShowForm={setShowForm} />
      )}
      {/* {type === "animals" && (
        <AnimalLists currentConfig={currentConfig} setShowForm={setShowForm} />
      )} */}
      {type === "user-accounts" && (
        <UserLists
          currentConfig={currentConfig}
          setShowForm={setShowForm}
          setEditing={setEditing}
        />
      )}
      {type === "livestock-category" && (
        <AnimalCategoriesLists
          currentConfig={currentConfig}
          setShowForm={setShowForm}
          setEditing={setEditing}
        />
      )}
      {type === "livestock-type" && (
        <AnimalTypesLists
          currentConfig={currentConfig}
          setShowForm={setShowForm}
          setEditing={setEditing}
        />
      )}
      {type === "production-capacity" && (
        <ProductionCapacityLists
          currentConfig={currentConfig}
          setShowForm={setShowForm}
          setEditing={setEditing}
        />
      )}
    </div>
  );
}
