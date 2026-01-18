
// Handles GET (all animal_info) and POST (create item)
import { NextRequest, NextResponse } from 'next/server';
import { readItems, createItem } from '@directus/sdk';
import { directus } from '@/core/lib/directus'

// GET - Fetch all animal_info
export async function GET(request: NextRequest) {
    try {
        const animal_info = await directus.request(
            readItems('animal_info', {
                fields: ['*'],
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
                production_capacity: body.production_capacity,
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

