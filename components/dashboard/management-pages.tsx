"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import UserForm from "./user-form";
import OfficeForm from "./office-form";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/core/contants/endpoints";

interface ManagementPageProps {
  type: "animals" | "cattle-category" | "user-accounts" | "offices";
}

export default function ManagementPage({ type }: ManagementPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({});
  const [offices, setOffices] = useState<any[]>([
    { id: "1", name: "Central Veterinary Office - Kathmandu" },
    { id: "2", name: "District Livestock Office - Pokhara" },
  ]);

  const config: {
    [key: string]: {
      title: string;
      description: string;
      fields: { name: string; label: string; placeholder: string }[];
    };
  } = {
    animals: {
      title: "Manage Animals",
      description: "Add and manage livestock types in your system",
      fields: [
        {
          name: "name",
          label: "Animal Name",
          placeholder: "e.g., Cattle, Goat, Sheep",
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
    "cattle-category": {
      title: "Cattle Categories",
      description: "Create and manage cattle breed categories",
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

  const handleAddItem = () => {
    if (type === "user-accounts") return; // Use dedicated form
    if (type === "offices") return; // Use dedicated form

    if (Object.values(formData).some((val) => val)) {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          ...formData,
        },
      ]);
      setFormData({});
      setShowForm(false);
    }
  };

  const handleUserSubmit = (user: any) => {
    setItems([...items, user]);
    setShowForm(false);
  };

 

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    if (type === "offices") {
      setOffices(offices.filter((item) => item.id !== id));
    }
  };

  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            {type === "user-accounts" ? (
              <UserForm
                onClose={() => setShowForm(false)}
                onSubmit={handleUserSubmit}
                offices={offices}
              />
            ) : type === "offices" ? (
              <OfficeForm onClose={() => setShowForm(false)} />
            ) : (
              <Card className="shadow-xl">
                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Add {currentConfig.title.split(" ").pop()}
                  </h3>
                  <div className="space-y-4 mb-6">
                    {/* {currentConfig.fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {field.label}
                        </label>
                        <Input
                          placeholder={field.placeholder}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [field.name]: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    ))} */}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddItem}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {items.length > 0 && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 ? (
        <Card className="p-12 text-center border-border/50">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary mb-4">
            <Plus size={24} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            No items yet. Create your first {currentConfig.title.toLowerCase()}.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus size={18} />
            Create Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  {item.phoneNumber && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +977 {item.phoneNumber}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <Edit2 size={16} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {Object.entries(item)
                  .filter(
                    ([key]) => !["id", "name", "phoneNumber"].includes(key),
                  )
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key}:
                      </span>
                      <span className="font-medium text-foreground">
                        {value as string}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
