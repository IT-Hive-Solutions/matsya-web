import { Status } from "./status.interface";

export interface AnimalCategory {
    id: number;
    status: Status;
    sort: number;
    category_name: string;
    date_created?: string;
    date_updated?: string;
};