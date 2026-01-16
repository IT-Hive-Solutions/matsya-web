import { createDirectus, rest } from '@directus/sdk';
import { Users } from '../interfaces/user.interface';
import { Province } from '../interfaces/province.interface';
import { AnimalCategory } from '../interfaces/animalCategory.interface';
import { AnimalInfo } from '../interfaces/animalInfo.interface';
import { AnimalType } from '../interfaces/animalType.interface';
import { District } from '../interfaces/district.interface';
import { ProductionCapacity } from '../interfaces/productionCapacity.interface';
import { OwnersInfo } from '../interfaces/ownersInfo.interface';


type Schema = {
    users: Users[];
    province: Province[];
    animal_category: AnimalCategory[];
    animal_info: AnimalInfo[];
    animal_types: AnimalType[];
    district: District[];
    production_capacity: ProductionCapacity[];
    owners_info: OwnersInfo[]
};

export const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!)
    .with(rest());

