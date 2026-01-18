
import { NextRequest, NextResponse } from 'next/server';
import { readItems, createItem } from '@directus/sdk';
import { directus } from '@/core/lib/directus'

// GET - Fetch all production_capacity
export async function GET(request: NextRequest) {
    try {
        const production_capacity = await directus.request(
            readItems('production_capacity', {
                fields: ['*'],
                sort: ['-date_created'],
            })
        );

        return NextResponse.json({
            success: true,
            data: production_capacity
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch capacity' },
            { status: 500 }
        );
    }
}

// POST - Create new item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.capacity_name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }


        const newCapacity = await directus.request(
            createItem('production_capacity', {
                capacity_name: body.capacity_name,
            })
        );

        return NextResponse.json(
            { success: true, data: newCapacity },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create capacity' },
            { status: 500 }
        );
    }
}

