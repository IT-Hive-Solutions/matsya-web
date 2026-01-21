import { IProvince } from "./province.interface";
import { Status } from "./status.interface";

export interface DistrictDirectus {
    id: number;
    status: Status;
    sort: number;
    district_name: string;
    province_id: number;
    date_created?: string;
    date_updated?: string;
};

export interface IDistrict {
    id: number;
    status: string;
    sort: number | null;
    user_created: string;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;
    district_name: string;
    province_id: IProvince;
}