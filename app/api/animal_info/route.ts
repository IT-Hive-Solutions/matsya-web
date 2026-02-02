
// Handles GET (all animal_info) and POST (create item)
import { VerificationStatus } from '@/core/enums/verification-status.enum';
import { withMiddleware } from '@/core/lib/api.middleware';
import { directus } from '@/core/lib/directus';
import { createItem, readItems } from '@directus/sdk';
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

        // Build the filter based on user role
        let filter: any = {};

        switch (userRole) {
            case "admin":
                // Admin can see all animals - no filter needed
                break;

            case "province-level":
                // Province level officer sees animals from their province
                if (userProvinceId) {
                    filter = {
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
                    filter = {
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
                    filter = {
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

        const animal_info = await directus.request(
            readItems('animal_info', {
                fields: [
                    '*',
                    "owners_id.*",
                    "animal_category.*",
                    "animal_type.*",
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
            if (owner.length < 0) {
                return NextResponse.json(
                    { success: false, error: 'Owner Not Found!' },
                    { status: 404 }
                );
            }
            body.owners_id = owner[0].id;
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