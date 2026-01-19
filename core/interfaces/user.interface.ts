import { IOffice } from "./office.interface";
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
export interface IUser {
    id: number;
    status: string;
    sort: number | null;
    user_created: string;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;
    full_name: string;
    email: string;
    phone_number: string;
    office_id: IOffice;
}
