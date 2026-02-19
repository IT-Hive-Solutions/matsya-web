export const DIRECTUS_BASE_URL = process.env.DIRECTUS_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
console.log({ DIRECTUS_BASE_URL });

export const directusEndpoints = {
    auth: {
        login: `${DIRECTUS_BASE_URL}/auth/login`,
        logout: `${DIRECTUS_BASE_URL}/auth/logout`,
        refresh: `${DIRECTUS_BASE_URL}/auth/refresh`,
        cookies: `${DIRECTUS_BASE_URL}/auth/cookie`,
        "reset-password": `${DIRECTUS_BASE_URL}/auth/reset-password`,
        "forgot-password": `${DIRECTUS_BASE_URL}/auth/forgot-password`
    },
    users: Object.assign(
        `users`,
        {
            byId: (id: string) => `users/${id}`,
            me: `users/me`,
        }
    ),
    province: Object.assign(
        `items/province`,
        { byId: (id: number) => `items/province/${id}`, }
    ),
    district: Object.assign(
        `items/district`,
        { byId: (id: number) => `items/district/${id}`, }
    ),
    animal_category: Object.assign(
        `items/animal_category`,
        { byId: (id: number) => `items/animal_category/${id}`, }
    ),
    animal_types: Object.assign(
        `items/animal_types`,
        { byId: (id: number) => `items/animal_types/${id}`, }
    ),
    animal_info: Object.assign(
        `items/animal_info`,
        {
            byId: (id: number) => `items/animal_info/${id}`,
            "create-multiple": `items/animal_info/create-multiple`,
        }
    ),
    office: Object.assign(
        `items/office`,
        { byId: (id: number) => `items/office/${id}`, }
    ),
    owner_info: Object.assign(
        `items/owner_info`,
        { byId: (id: number) => `items/owner_info/${id}`, }
    ),
    production_capacity: Object.assign(
        `items/production_capacity`,
        { byId: (id: number) => `items/production_capacity/${id}`, }
    ),
    app_download_link: `items/app_download_link`,

}