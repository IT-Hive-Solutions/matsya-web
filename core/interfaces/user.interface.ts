import { IDistrict } from "./district.interface";
import { IOffice } from "./office.interface";
import { IProvince } from "./province.interface";
import { Status } from "./status.interface";

export const USER_TYPES = ["admin", "province-level", "district", "local", "vaccinator"] as const;

export type UserType = typeof USER_TYPES[number];

export const userTypeOptions = [
    {
        label: "Administrator",
        value: "admin"
    },
    {
        label: "Province Level Officer",
        value: "province-level"
    },
    {
        label: "District Level Officer",
        value: "district-level"
    },
    {
        label: "Local Level Officer",
        value: "local-level"
    },
    {
        label: "Vaccinator",
        value: "vaccinator"
    },

]

export interface UsersDirectus {
    id: number;
    status: Status;
    sort: number;
    full_name: string;
    email: string;
    password: string;
    office_id: number;
    phone_number: string;
    user_type: UserType;
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
    password: string;
    user_type: UserType;
    office_id: IOffice;
}
