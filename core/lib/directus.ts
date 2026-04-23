import { AnimalInfoDirectus } from '@/core/interfaces/animal.interface';
import { AnimalCategoryDirectus } from '@/core/interfaces/animalCategory.interface';
import { AnimalTypeDirectus } from '@/core/interfaces/animalType.interface';
import { DistrictDirectus } from '@/core/interfaces/district.interface';
import { OfficeDirectus } from '@/core/interfaces/office.interface';
import { OwnersInfoDirectus } from '@/core/interfaces/ownersInfo.interface';
import { ProductionCapacityDirectus } from '@/core/interfaces/productionCapacity.interface';
import { ProvinceDirectus } from '@/core/interfaces/province.interface';
import { UsersDirectus } from '@/core/interfaces/user.interface';
import {
    authentication,
    createDirectus,
    rest,
    staticToken
} from "@directus/sdk";
import { AppDownloadLinkDirectus } from '../interfaces/appDownloadLink.interface';
import { DIRECTUS_BASE_URL, DIRECTUS_STATIC_TOKEN } from '../contants/directusEndpoints';


export type Schema = {
    directus_users: UsersDirectus[];
    users: UsersDirectus[];
    province: ProvinceDirectus[];
    animal_category: AnimalCategoryDirectus[];
    animal_info: AnimalInfoDirectus[];
    animal_types: AnimalTypeDirectus[];
    district: DistrictDirectus[];
    production_capacity: ProductionCapacityDirectus[];
    owners_info: OwnersInfoDirectus[];
    office: OfficeDirectus[];
    app_download_link: AppDownloadLinkDirectus[];
};

export function getDirectusClient(token: string) {
    return createDirectus(DIRECTUS_BASE_URL)
        .with(staticToken(token))  // token already managed by your cookie system
        .with(rest())
}
export function getDirectusWithStaticToken() {
    return createDirectus(DIRECTUS_BASE_URL)
        .with(staticToken(DIRECTUS_STATIC_TOKEN))  // token already managed by your cookie system
        .with(rest())
}

export function createServerClient(token?: string) {
    const client = createDirectus(DIRECTUS_BASE_URL).with(rest());
    if (token) {
        return createDirectus(DIRECTUS_BASE_URL).with(staticToken(token)).with(rest());
    }
    return client;
}

export const directusPublic = createDirectus(DIRECTUS_BASE_URL).with(rest());
export const loginDirectus = createDirectus(DIRECTUS_BASE_URL).with(rest()).with(authentication('json'));


export function getAssetURL(fileId: string) {
    return `${DIRECTUS_BASE_URL}assets/${fileId}`;
}

export function getDownloadUrl(fileId: string) {
    return `${DIRECTUS_BASE_URL}assets/${fileId}?download`;
}

export { DIRECTUS_BASE_URL };

