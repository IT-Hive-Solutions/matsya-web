import { endpoints } from "@/core/contants/endpoints";
import { IAnimalCategories } from "@/core/interfaces/animalCategory.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useCustomReactPaginatedTable } from "@/hooks/reactTableHook";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Config } from "../dashboard/management-pages";
import Loading from "../loading";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { DataTableWithPagination } from "../ui/data-table-with-pagination";
import { Input } from "../ui/input";

type Props = {
  currentConfig: Config;
  setShowForm: Dispatch<SetStateAction<boolean>>;
};
export const animalCategoriesColumns: ColumnDef<IAnimalCategories>[] = [
  {
    accessorKey: "category_name",
    header: "Name",
  },
];

const AnimalCategoriesLists = ({ currentConfig, setShowForm }: Props) => {
  const [animalCategoriesLists, setAnimalCategoriesLists] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: fetchedAnimalCategoriesList, isLoading } = useQuery({
    queryKey: ["animal-categories"],
    queryFn: () => fetchProtectedHandler(endpoints.animal_category),
  });
  useEffect(() => {
    if (fetchedAnimalCategoriesList?.data) {
      setAnimalCategoriesLists(fetchedAnimalCategoriesList?.data);
    }
  }, [fetchedAnimalCategoriesList]);
  console.log({ animalCategoriesLists });

  const animalCategoriesTable = useCustomReactPaginatedTable<
    IAnimalCategories,
    any
  >({
    data: animalCategoriesLists,
    columns: animalCategoriesColumns,
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {animalCategoriesLists?.length > 0 ? (
        <DataTableWithPagination table={animalCategoriesTable} />
      ) : (
        <Card className="p-12 text-center border-border/50">
          <p className="text-muted-foreground mb-4 text-sm">
            No items yet. Create your first {currentConfig.title.toLowerCase()}.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            className="gap-2 hover:cursor-pointer"
          >
            <Plus size={18} />
            Create Now
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AnimalCategoriesLists;
