
import { NextRequest, NextResponse } from 'next/server';
import { readItems, createItem } from '@directus/sdk';
import { directus } from '@/core/lib/directus'

// GET - Fetch all office
export async function GET(request: NextRequest) {
    try {
        const office = await directus.request(
            readItems('office', {
                fields: ['*'],
                sort: ['-date_created'],
            })
        );

        return NextResponse.json({
            success: true,
            data: office
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch office' },
            { status: 500 }
        );
    }
}

// POST - Create new item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.district_id) {
            return NextResponse.json(
                { success: false, error: 'District is required' },
                { status: 400 }
            );
        }
        if (!body.email_id) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }
        if (!body.office_name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }
        if (!body.province_id) {
            return NextResponse.json(
                { success: false, error: 'Province is required' },
                { status: 400 }
            );
        }

        const newOffice = await directus.request(
            createItem('office', {
                district_id: body.district_id,
                office_email: body.office_email,
                office_name: body.office_name,
                province_id: body.province_id,
            })
        );

        return NextResponse.json(
            { success: true, data: newOffice },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create office' },
            { status: 500 }
        );
    }
}

