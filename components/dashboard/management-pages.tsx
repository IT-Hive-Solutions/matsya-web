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

interface ManagementPageProps {
  type: "animals" | "animal-category" | "user-accounts" | "offices";
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

  const config: {
    [key: string]: Config;
  } = {
    animals: {
      title: "Manage Animals",
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
    "animal-category": {
      title: "Animal Categories",
      description: "Create and manage animal breed categories",
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
  };

  const currentConfig = config[type];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {currentConfig.title}
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
              <UserForm onClose={() => setShowForm(false)} />
            )}
            {type === "offices" && (
              <OfficeForm onClose={() => setShowForm(false)} />
            )}
            {type === "animal-category" && (
              <AnimalCategoryForm onClose={() => setShowForm(false)} />
            )}
            {type === "animals" && (
              <AnimalForm onClose={() => setShowForm(false)} />
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
        <UserLists currentConfig={currentConfig} setShowForm={setShowForm} />
      )}
      {type === "animal-category" && (
        <AnimalCategoriesLists
          currentConfig={currentConfig}
          setShowForm={setShowForm}
        />
      )}
    </div>
  );
}
