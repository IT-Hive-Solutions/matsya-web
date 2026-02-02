import { IOffice } from "./office.interface";
import { Status } from "./status.interface";

export const USER_TYPES = ["admin", "province-level", "district-level", "local-level", "vaccinator"] as const;

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
    needs_password_change: boolean;
    office_id: number;
    phone_number: string;
    user_type: UserType;
    date_created?: string;
    date_updated?: string;
};
export interface IUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    location: string | null;
    title: string | null;
    description: string | null;
    tags: string | null;
    avatar: string | null;
    language: string | null;
    tfa_secret: string | null;
    status: string;
    role: IRole;
    token: string | null;
    last_access: string;
    last_page: string | null;
    provider: string;
    external_identifier: string | null;
    auth_data: any | null;
    email_notifications: boolean;
    appearance: string | null;
    theme_dark: string | null;
    theme_light: string | null;
    theme_light_overrides: any | null;
    theme_dark_overrides: any | null;
    text_direction: string;
    needs_password_change: boolean;
    phone_number: string;
    policies: any[];
    user_type: UserType;
    office_id: IOffice;
}


interface IRole {
    id: string;
    name: string;
    description: string;
    icon: string;
    parent: string | null;
    children: string[];
    policies: string[];
    users: string[];
}
