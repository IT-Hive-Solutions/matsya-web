import { Status } from "./status.interface";

export interface Office {
    id: number;
    status: Status;
    sort: number;
    office_name: string;
    office_address: string;
    office_email: string;
    district_id: number;
    province_id: number;
    date_created?: string;
    date_updated?: string;
};