import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/core/lib/directus';
import { readItem, updateItem, deleteItem } from '@directus/sdk';

type Params = {
    params: Promise<{
        id: string;
    }>;
};


export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const owners_info = await directus.request(
            readItem('owners_info', parseInt(id))
        );

        return NextResponse.json({
            success: true,
            data: owners_info
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Owner not found' },
            { status: 404 }
        );
    }
}


export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();

        const { id } = await params

        const updatedOwner = await directus.request(
            updateItem('owners_info', parseInt(id), {
                district_name: body.district_name,
            })
        );

        return NextResponse.json({
            success: true,
            data: updatedOwner
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update owner' },
            { status: 500 }
        );
    }
}


export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        await directus.request(
            deleteItem('owners_info', parseInt(id))
        );

        return NextResponse.json({
            success: true,
            message: 'Owner deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete owner' },
            { status: 500 }
        );
    }
}
