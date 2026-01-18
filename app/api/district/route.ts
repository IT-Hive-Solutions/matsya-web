
// app/api/district/route.ts
// Handles GET (all district) and POST (create item)
import { NextRequest, NextResponse } from 'next/server';
import { readItems, createItem } from '@directus/sdk';
import { directus } from '@/core/lib/directus'

// GET - Fetch all district
export async function GET(request: NextRequest) {
    try {
        const district = await directus.request(
            readItems('district', {
                fields: ['*', 'province_id.*'],
                sort: ['-date_created'],
            })
        );

        return NextResponse.json({
            success: true,
            data: district
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch district' },
            { status: 500 }
        );
    }
}

// POST - Create new item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.district_name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        const newDistrict = await directus.request(
            createItem('district', {
                district_name: body.district_name,
                province_id: body.province_id,
            })
        );

        return NextResponse.json(
            { success: true, data: newDistrict },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create district' },
            { status: 500 }
        );
    }
}

