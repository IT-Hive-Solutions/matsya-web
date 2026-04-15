import { IDistrict } from "./district.interface";
import { IProvince } from "./province.interface";
import { Status } from "./status.interface";

export interface OfficeDirectus {
    id: number;
    status: Status;
    sort: number;
    office_name: string;
    office_address: string;
    office_email: string;
    district_id: number;
    province_id: number;
    min_assigned_tag_number: number;
    max_assigned_tag_number: number;
    date_created?: string;
    date_updated?: string;

};



export interface IOffice {
    id: number;
    status: string;
    sort: number | null;
    user_created: string;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;
    office_name: string;
    office_address: string;
    office_contact: string;
    office_email: string;
    min_assigned_tag_number: number;
    max_assigned_tag_number: number;
    province_id: IProvince;
    district_id: IDistrict;
}