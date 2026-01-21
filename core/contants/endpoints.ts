export const baseUrl = process.env.NEXT_BASE_PUBLIC_URL ?? "/api"
export const endpoints = {
    auth: {
        login: `${baseUrl}/auth/login`,
        cookies: `${baseUrl}/auth/cookie`,
        "reset-password": `${baseUrl}/auth/reset-password`,
        "forgot-password": `${baseUrl}/auth/forgot-password`
    },
    users: Object.assign(
        `${baseUrl}/users`,
        { byId: (id: number) => `${baseUrl}/users/${id}`, }
    ),
    province: Object.assign(
        `${baseUrl}/province`,
        { byId: (id: number) => `${baseUrl}/province/${id}`, }
    ),
    district: Object.assign(
        `${baseUrl}/district`,
        { byId: (id: number) => `${baseUrl}/district/${id}`, }
    ),
    animal_category: Object.assign(
        `${baseUrl}/animal_category`,
        { byId: (id: number) => `${baseUrl}/animal_category/${id}`, }
    ),
    animal_types: Object.assign(
        `${baseUrl}/animal_types`,
        { byId: (id: number) => `${baseUrl}/animal_types/${id}`, }
    ),
    animal_info: Object.assign(
        `${baseUrl}/animal_info`,
        { byId: (id: number) => `${baseUrl}/animal_info/${id}`, }
    ),
    office: Object.assign(
        `${baseUrl}/office`,
        { byId: (id: number) => `${baseUrl}/office/${id}`, }
    ),
    owner_info: Object.assign(
        `${baseUrl}/owner_info`,
        { byId: (id: number) => `${baseUrl}/owner_info/${id}`, }
    ),
    production_capacity: Object.assign(
        `${baseUrl}/production_capacity`,
        { byId: (id: number) => `${baseUrl}/production_capacity/${id}`, }
    ),
}