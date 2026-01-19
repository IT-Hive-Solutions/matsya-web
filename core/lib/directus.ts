import { createDirectus, rest, staticToken } from '@directus/sdk';
import { UsersDirectus } from '../interfaces/user.interface';
import { ProvinceDirectus } from '../interfaces/province.interface';
import { AnimalCategoryDirectus } from '../interfaces/animalCategory.interface';
import { AnimalInfoDirectus } from '../interfaces/animalInfo.interface';
import { AnimalTypeDirectus } from '../interfaces/animalType.interface';
import { DistrictDirectus } from '../interfaces/district.interface';
import { ProductionCapacityDirectus } from '../interfaces/productionCapacity.interface';
import { OwnersInfoDirectus } from '../interfaces/ownersInfo.interface';
import { OfficeDirectus } from '../interfaces/office.interface';
const staticTokenValue = process.env.NEXT_PUBLIC_DIRECTUS_STATIC_TOKEN ?? ""

console.log({ staticTokenValue });

type Schema = {
    users: UsersDirectus[];
    province: ProvinceDirectus[];
    animal_category: AnimalCategoryDirectus[];
    animal_info: AnimalInfoDirectus[];
    animal_types: AnimalTypeDirectus[];
    district: DistrictDirectus[];
    production_capacity: ProductionCapacityDirectus[];
    owners_info: OwnersInfoDirectus[];
    office: OfficeDirectus[];
};

export const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!)
    .with(rest())
    .with(staticToken(staticTokenValue));


