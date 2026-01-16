import { Status } from "./status.interface";

export interface Province {
    id: number;
    status: Status;
    sort: number;
    province_name: string;
    date_created?: string;
    date_updated?: string;
};