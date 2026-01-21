
import { NextRequest, NextResponse } from 'next/server';
import { readItems, createItem } from '@directus/sdk';
import { directus } from '@/core/lib/directus'

// GET - Fetch all animal_types
export async function GET(request: NextRequest) {
    try {
        const animal_types = await directus.request(
            readItems('animal_types', {
                fields: ['*'],
                sort: ['-date_created'],
            })
        );

        return NextResponse.json({
            success: true,
            data: animal_types
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch types' },
            { status: 500 }
        );
    }
}

// POST - Create new item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.animal_name) {
            return NextResponse.json(
                { success: false, error: 'Type is required' },
                { status: 400 }
            );
        }

        const newType = await directus.request(
            createItem('animal_types', {
                animal_name: body.animal_name,
            })
        );

        return NextResponse.json(
            { success: true, data: newType },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create type' },
            { status: 500 }
        );
    }
}

