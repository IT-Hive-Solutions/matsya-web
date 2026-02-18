import { IDistrict } from "./district.interface";
import { Status } from "./status.interface";

export interface OwnersInfoDirectus {
    id: number;
    status: Status;
    sort: number;
    local_level_name: string;
    district_id: number;
    date: string;
    owners_name: string;
    owners_contact: string;
    ward_number: string;
    date_created?: string;
    date_updated?: string;
};

export interface IOwner {
    id: number;
    status: string;
    sort: null | number;
    user_created: string;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;
    local_level_name: string;
    municipality?: string;
    date: string;
    owners_name: string;
    ward_number: string;
    district_id: IDistrict;
    owners_contact: string;
}