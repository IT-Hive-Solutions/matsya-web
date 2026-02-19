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
        `${DIRECTUS_BASE_URL}/directus_users`,
        {
            byId: (id: string) => `${DIRECTUS_BASE_URL}/directus_users/${id}`,
            me: `users/me`,
        }
    ),
    province: Object.assign(
        `province`,
        { byId: (id: number) => `province/${id}`, }
    ),
    district: Object.assign(
        `district`,
        { byId: (id: number) => `district/${id}`, }
    ),
    animal_category: Object.assign(
        `animal_category`,
        { byId: (id: number) => `animal_category/${id}`, }
    ),
    animal_types: Object.assign(
        `animal_types`,
        { byId: (id: number) => `animal_types/${id}`, }
    ),
    animal_info: Object.assign(
        `animal_info`,
        {
            byId: (id: number) => `animal_info/${id}`,
            "create-multiple": `animal_info/create-multiple`,
            "update_animal_status": (id: number) => `animal_info/${id}/update_animal_status`,
        }
    ),
    office: Object.assign(
        `office`,
        { byId: (id: number) => `office/${id}`, }
    ),
    owner_info: Object.assign(
        `owner_info`,
        { byId: (id: number) => `owner_info/${id}`, }
    ),
    production_capacity: Object.assign(
        `production_capacity`,
        { byId: (id: number) => `production_capacity/${id}`, }
    ),
    app_download_link: `app_download_link`,

}