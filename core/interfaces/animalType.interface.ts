import { Status } from "./status.interface";

export interface AnimalType {
    id: number;
    status: Status;
    sort: number;
    animal_name: string;
    date_created?: string;
    date_updated?: string;
};