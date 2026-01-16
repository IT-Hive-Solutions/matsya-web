import { Status } from "./status.interface";

export interface District {
    id: number;
    status: Status;
    sort: number;
    district_name: string;
    province_id: number;
    date_created?: string;
    date_updated?: string;
};