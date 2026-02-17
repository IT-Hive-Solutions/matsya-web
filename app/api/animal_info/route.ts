
// Handles GET (all animal_info) and POST (create item)
import { VerificationStatus } from '@/core/enums/verification-status.enum';
import { withMiddleware } from '@/core/lib/api.middleware';
import { directus } from '@/core/lib/directus';
import { createItem, readItems, updateItem } from '@directus/sdk';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all animal_info
async function getHandler(request: NextRequest) {
    try {
        const userDataString = request.headers.get('x-user-data');
        const userData = JSON.parse(userDataString ?? "")

        // Determine the user's role
        const userRole = userData.role.name; // "vaccinator", "admin", etc.
        const userDistrictId = userData.office_id.district_id?.id;
        const userProvinceId = userData.office_id.province_id;
        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get('searchQuery')?.trim();

        // Build the search filter if a query is provided
        const searchFilter = searchQuery
            ? {
                _or: [
                    { animal_category: { category_name: { _contains: searchQuery } } },
                    { animal_type: { animal_name: { _contains: searchQuery } } },
                    { owners_id: { owners_name: { _contains: searchQuery } } },
                    { owners_id: { owners_contact: { _contains: searchQuery } } },
                    { owners_id: { district_id: { district_name: { _contains: searchQuery } } } },
                    { owners_id: { district_id: { province_id: { province_name: { _contains: searchQuery } } } } },
                    { tag_number: { _contains: searchQuery } },
                    { production_capacity: { capacity_name: { _contains: searchQuery } } },
                ],
            }
            : null;

        // Build the filter based on user role
        let roleFilter: any = {};

        switch (userRole) {
            case "admin":
                // Admin can see all animals - no roleFilter needed
                break;

            case "province-level":
                // Province level officer sees animals from their province
                if (userProvinceId) {
                    roleFilter = {
                        owners_id: {
                            district_id: {
                                province_id: {
                                    id: {
                                        _eq: userProvinceId
                                    }
                                }
                            }
                        }
                    };
                }
                break;

            case "district-level":
            case "local-level":
            case "vaccinator":
                // District level, local level, and vaccinator see animals from their district
                if (userDistrictId) {
                    roleFilter = {
                        owners_id: {
                            district_id: {
                                id: {
                                    _eq: userDistrictId
                                }
                            }
                        }
                    };
                }
                break;

            default:
                // If role is unknown, restrict to district level as a safe default
                if (userDistrictId) {
                    roleFilter = {
                        owners_id: {
                            district_id: {
                                id: {
                                    _eq: userDistrictId
                                }
                            }
                        }
                    };
                }
                break;
        }

        const filters = [roleFilter, searchFilter].filter(Boolean);
        const filter = filters.length > 1
            ? { _and: filters }
            : filters[0] ?? {};


        const animal_info = await directus.request(
            readItems('animal_info', {
                fields: [
                    '*',
                    "owners_id.*",
                    "animal_category.*",
                    "animal_type.*",
                    "production_capacity.*",
                    "owners_id.district_id.*",
                    "owners_id.district_id.province_id.*",
                ],
                filter: filter, // Apply the filter
                sort: ['-date_created'],
            })
        );

        return NextResponse.json({
            success: true,
            data: animal_info,
            // Optional: include metadata for debugging
            meta: {
                userRole,
                searchQuery: searchQuery ?? null,
                filteredBy: userRole === "admin" ? "none" :
                    userRole === "province-level" ? `province_id: ${userProvinceId}` :
                        `district_id: ${userDistrictId}`
            }
        });

        return NextResponse.json({
            success: true,
            data: animal_info
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch animals' },
            { status: 500 }
        );
    }
}

// POST - Create new item
async function postHandler(request: NextRequest) {
    try {
        const body = await request.json();

        if (!(body.age_months || body.age_years)) {
            return NextResponse.json(
                { success: false, error: 'Age is required' },
                { status: 400 }
            );
        }
        if (!body.tag_number) {
            return NextResponse.json(
                { success: false, error: 'Tag Number is required' },
                { status: 400 }
            );
        }
        if (!body.animal_category) {
            return NextResponse.json(
                { success: false, error: 'Category is required' },
                { status: 400 }
            );
        }
        if (!body.animal_type) {
            return NextResponse.json(
                { success: false, error: 'Type is required' },
                { status: 400 }
            );
        }

        if (body.owners_contact) {
            const owner = await directus.request(
                readItems('owners_info', {
                    filter: {
                        owners_contact: {
                            _eq: body.owners_contact
                        }
                    }
                })
            )
            if (!owner[0]) {
                if (!body.owners_name) {
                    return NextResponse.json(
                        { success: false, error: 'Name is required' },
                        { status: 400 }
                    );
                }
                if (!body.district) {
                    return NextResponse.json(
                        { success: false, error: 'District is required' },
                        { status: 400 }
                    );
                }
                if (!body.local_level) {
                    return NextResponse.json(
                        { success: false, error: 'Local Level is required' },
                        { status: 400 }
                    );
                }
                if (!body.municipality) {
                    return NextResponse.json(
                        { success: false, error: 'Municipality is required' },
                        { status: 400 }
                    );
                }
                const payload = {
                    owners_name: body.owners_name,
                    owners_contact: body.owners_contact,
                    ward_number: body.ward_number,
                    district_id: body.district_id,
                    local_level_name: body.local_level_name,
                    date: body.date,
                    latitude: body.latitude,
                    municipality: body.municipality,
                    longitude: body.longitude,
                }
                const newOwner = await directus.request(
                    createItem('owners_info', payload)
                );
                if (!newOwner) {
                    return NextResponse.json(
                        { success: false, error: 'Owner Creation failed!' },
                        { status: 404 }
                    );
                }
                body.owner_id = newOwner.id;
            } else {
                const updatePayload: any = {}
                if (body.province_id) {
                    updatePayload.province_id = body.province_id
                }
                if (body.district_id) {
                    updatePayload.district_id = body.district_id
                }
                if (body.municipality) {
                    updatePayload.municipality = body.municipality
                }
                if (body.localLevelName) {
                    updatePayload.local_level_name = body.localLevelName
                }
                if (body.latitude) {
                    updatePayload.latitude = body.latitude
                }
                if (body.longitude) {
                    updatePayload.longitude = body.longitude
                }

                const updatedOwner = await directus.request(
                    updateItem('owners_info', parseInt(String(owner[0].id)), updatePayload)
                );
                if (!updatedOwner) {
                    return NextResponse.json(
                        { success: false, error: 'Owner Update failed!' },
                        { status: 404 }
                    );
                }
                body.owners_id = owner[0].id;

            }
        }



        const newAnimal = await directus.request(
            createItem('animal_info', {
                age_months: body.age_months,
                age_years: body.age_years,
                animal_category: body.animal_category,
                animal_type: body.animal_type,
                is_vaccination_applied: body.is_vaccination_applied,
                latitude: body.latitude,
                longitude: body.longitude,
                owners_id: body.owners_id,
                tag_number: body.tag_number,
                production_capacity: body.production_capacity,
                verification_status: VerificationStatus.Pending
            })
        );

        return NextResponse.json(
            { success: true, data: newAnimal },
            { status: 201 }
        );
    } catch (error: any) {

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create animal' },
            { status: 500 }
        );
    }
}


export const GET = withMiddleware(getHandler)
export const POST = withMiddleware(postHandler)