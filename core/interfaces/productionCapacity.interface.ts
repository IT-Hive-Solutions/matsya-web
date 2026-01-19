import { Status } from "./status.interface";

export interface ProductionCapacityDirectus {
    id: number;
    status: Status;
    sort: number;
    capacity_name: string;
    date_created?: string;
    date_updated?: string;
};