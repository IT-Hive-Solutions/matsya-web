import { endpoints } from "@/core/contants/endpoints";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Syringe,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "./view-entries";

type Props = {
  onClose: () => void;
  animalId: number;
};

const AnimalDetail = ({ onClose, animalId }: Props) => {
  const [animal, setAnimal] = useState<IAnimal>();
  const { data: fetchedAnimalData } = useQuery({
    queryKey: ["animal"],
    queryFn: () =>
      fetchProtectedHandler(endpoints.animal_info.byId(animalId ?? -1)),
    enabled: !!animalId,
  });
  useEffect(() => {
    if (fetchedAnimalData?.data) {
      setAnimal(fetchedAnimalData?.data);
    }
  }, [fetchedAnimalData]);
  console.log({ animal });

  return (
    <Card className="w-full h-3/4 overflow-y-auto max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">
              {animal?.animal_type.animal_name} - Tag #{animal?.tag_number}
            </CardTitle>
            <CardDescription className="mt-1 flex flex-col gap-2">
              {animal?.animal_category.category_name}
              <div className="flex gap-2">
                <StatusBadge status={animal?.verification_status ?? ""} />
              </div>
            </CardDescription>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:cursor-pointer hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rejection Alert */}
        {animal?.verification_status === "rejected" &&
          animal?.rejection_reason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rejection Reason:</strong> {animal?.rejection_reason}
              </AlertDescription>
            </Alert>
          )}

        {/* Animal Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Animal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tag Number</p>
              <p className="font-medium">{animal?.tag_number}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Animal Type</p>
              <p className="font-medium">{animal?.animal_type.animal_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">
                {animal?.animal_category.category_name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Age</p>
              <p className="font-medium">
                {animal?.age_years} {animal?.age_years === 1 ? "year" : "years"}
                {animal?.age_months && ` ${animal?.age_months} months`}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Production Capacity
              </p>
              <p className="font-medium">{animal?.production_capacity}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Vaccination Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Syringe className="w-5 h-5" />
            Vaccination Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Vaccination Applied
              </p>
              <p className="font-medium">
                {animal?.is_vaccination_applied ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="w-3 h-3" />
                    No
                  </Badge>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Vaccination Date</p>
              <p className="font-medium">
                {animal?.vaccinated_date ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(animal?.vaccinated_date).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not available</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Owner Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            Owner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Owner Name</p>
              <p className="font-medium">{animal?.owners_id.owners_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Contact Number</p>
              <p className="font-medium flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {animal?.owners_id.owners_contact}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Local Level</p>
              <p className="font-medium">
                {animal?.owners_id.local_level_name}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ward Number</p>
              <p className="font-medium">
                Ward {animal?.owners_id.ward_number}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">District ID</p>
              <p className="font-medium">{animal?.owners_id.district_id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Registration Date</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {animal?.owners_id.date}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Location Information */}
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Latitude</p>
              <p className="font-medium">{animal?.latitude}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Longitude</p>
              <p className="font-medium">{animal?.longitude}</p>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps?q=${animal?.latitude},${animal?.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            View on Google Maps →
          </a>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            Created: {new Date(animal?.date_created ?? "").toLocaleString()}
          </p>
          <p>
            Last Updated:{" "}
            {new Date(animal?.date_updated ?? "").toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalDetail;
