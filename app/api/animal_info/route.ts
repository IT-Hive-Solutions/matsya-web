
// Handles GET (all animal_info) and POST (create item)
import { NextRequest, NextResponse } from 'next/server';
import { readItems, createItem } from '@directus/sdk';
import { directus } from '@/core/lib/directus'
import { VerificationStatus } from '@/core/enums/verification-status.enum';

// GET - Fetch all animal_info
export async function GET(request: NextRequest) {
    try {
        const animal_info = await directus.request(
            readItems('animal_info', {
                fields: [
                    '*',
                    "owners_id.*",
                    "animal_category.*",
                    "animal_type.*",
                ],
                sort: ['-date_created'],
            })
        );

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
export async function POST(request: NextRequest) {
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

