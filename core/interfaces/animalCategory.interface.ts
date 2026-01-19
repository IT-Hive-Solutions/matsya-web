import { Status } from "./status.interface";

export interface AnimalCategoryDirectus {
    id: number;
    status: Status;
    sort: number;
    category_name: string;
    date_created?: string;
    date_updated?: string;
};

export interface IAnimalCategories {
    id: number;
    status: Status;
    sort: number;
    category_name: string;
    date_created?: string;
    date_updated?: string;
}