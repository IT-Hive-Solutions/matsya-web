import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/core/lib/directus';
import { readItem, updateItem, deleteItem } from '@directus/sdk';

type Params = {
    params: {
        id: string;
    };
};


export async function GET(request: NextRequest, { params }: Params) {
    try {
        const production_capacity = await directus.request(
            readItem('production_capacity', params.id)
        );

        return NextResponse.json({
            success: true,
            data: production_capacity
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Capacity not found' },
            { status: 404 }
        );
    }
}


export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();

        const updatedCapacity = await directus.request(
            updateItem('production_capacity', params.id, {
                district_name: body.district_name,
            })
        );

        return NextResponse.json({
            success: true,
            data: updatedCapacity
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update capacity' },
            { status: 500 }
        );
    }
}


export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await directus.request(
            deleteItem('production_capacity', params.id)
        );

        return NextResponse.json({
            success: true,
            message: 'Capacity deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete owner' },
            { status: 500 }
        );
    }
}
