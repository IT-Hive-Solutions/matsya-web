import { Status } from "./status.interface";

export interface AnimalTypeDirectus {
    id: number;
    status: Status;
    sort: number;
    animal_name: string;
    date_created?: string;
    date_updated?: string;
};
export interface IAnimalType {
    id: number;
    status: Status;
    sort: number;
    animal_name: string;
    date_created?: string;
    date_updated?: string;
};