import { Status } from "./status.interface";

export interface OwnersInfo {
    id: number;
    status: Status;
    sort: number;
    local_level_name: string;
    district: string;
    date: string;
    owners_name: string;
    owners_contact: string;
    ward_number: string;
    date_created?: string;
    date_updated?: string;
};