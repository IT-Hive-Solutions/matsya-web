import { Status } from "./status.interface";

export interface ProvinceDirectus {
    id: number;
    status: Status;
    sort: number;
    province_name: string;
    date_created?: string;
    date_updated?: string;
};

export interface IProvince {
    id: number;
    status: string;
    sort: number | null;
    user_created: string;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;
    province_name: string;
}