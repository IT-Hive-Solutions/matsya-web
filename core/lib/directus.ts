import { AnimalInfoDirectus } from '@/core/interfaces/animal.interface';
import { AnimalCategoryDirectus } from '@/core/interfaces/animalCategory.interface';
import { AnimalTypeDirectus } from '@/core/interfaces/animalType.interface';
import { DistrictDirectus } from '@/core/interfaces/district.interface';
import { OfficeDirectus } from '@/core/interfaces/office.interface';
import { OwnersInfoDirectus } from '@/core/interfaces/ownersInfo.interface';
import { ProductionCapacityDirectus } from '@/core/interfaces/productionCapacity.interface';
import { ProvinceDirectus } from '@/core/interfaces/province.interface';
import { UsersDirectus } from '@/core/interfaces/user.interface';
import { authentication, createDirectus, rest, staticToken } from '@directus/sdk';

const staticTokenValue = process.env.NEXT_PUBLIC_DIRECTUS_STATIC_TOKEN ?? ""

type Schema = {
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
};

export const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!).
    with(rest()).
    with(authentication("cookie", { credentials: "include" }));
    // with(staticToken(staticTokenValue))




