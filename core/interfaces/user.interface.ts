import { Status } from "./status.interface";

export interface UsersDirectus {
    id: number;
    status: Status;
    sort: number;
    full_name: string;
    email: string;
    office_id: number;
    phone_number: string;
    date_created?: string;
    date_updated?: string;
};