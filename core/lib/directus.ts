import { createDirectus, rest, staticToken } from '@directus/sdk';
import { Users } from '../interfaces/user.interface';
import { Province } from '../interfaces/province.interface';
import { AnimalCategory } from '../interfaces/animalCategory.interface';
import { AnimalInfo } from '../interfaces/animalInfo.interface';
import { AnimalType } from '../interfaces/animalType.interface';
import { District } from '../interfaces/district.interface';
import { ProductionCapacity } from '../interfaces/productionCapacity.interface';
import { OwnersInfo } from '../interfaces/ownersInfo.interface';
import { Office } from '../interfaces/office.interface';
const staticTokenValue = process.env.NEXT_PUBLIC_DIRECTUS_STATIC_TOKEN ?? ""

console.log({ staticTokenValue });

type Schema = {
    users: Users[];
    province: Province[];
    animal_category: AnimalCategory[];
    animal_info: AnimalInfo[];
    animal_types: AnimalType[];
    district: District[];
    production_capacity: ProductionCapacity[];
    owners_info: OwnersInfo[];
    office: Office[];
};

export const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!)
    .with(rest())
    .with(staticToken(staticTokenValue));


