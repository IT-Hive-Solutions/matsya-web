import { Status } from "./status.interface";

export interface AnimalInfoDirectus {
    id: number;
    status: Status;
    sort: number;
    animal_category: string;
    animal_type: string;
    age_years: string;
    age_months: string;
    tag_number: string;
    is_vaccination_applied: string;
    production_capacity: string;
    latitude: number;
    longitude: number;
    owners_id: number;
    image?: string;
    date_created?: string;
    date_updated?: string;
};