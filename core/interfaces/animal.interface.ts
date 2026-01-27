import { Months } from "../enums/month.enum";
import { VerificationStatus } from "../enums/verification-status.enum";
import { IAnimalCategories } from "./animalCategory.interface";
import { IAnimalType } from "./animalType.interface";
import { IOwner } from "./ownersInfo.interface";
import { Status } from "./status.interface";


export interface AnimalInfoDirectus {
    id: number;
    status: Status;
    sort: number;
    animal_category: number;
    verification_status: VerificationStatus;
    animal_type: number;
    age_years: number;
    age_months: Months;
    tag_number: string;
    is_vaccination_applied: string;
    production_capacity: string;
    latitude: number;
    longitude: number;
    owners_id: number;
    image?: string;
    date_created?: string;
    date_updated?: string;
};



export interface IAnimal {
    id: number;
    status: string;
    sort: null | number;
    user_created: string;
    date_created: string;
    user_updated: string | null;
    date_updated: string | null;
    tag_number: string;
    verification_status: VerificationStatus;
    is_vaccination_applied: string;
    production_capacity: string;
    latitude: number;
    longitude: number;
    image: string | null;
    age_months: string;
    age_years: number;
    animal_category: IAnimalCategories;
    animal_type: IAnimalType;
    owners_id: IOwner;
}