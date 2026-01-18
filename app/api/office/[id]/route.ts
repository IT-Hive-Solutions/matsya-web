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
        const office = await directus.request(
            readItem('office', params.id)
        );

        return NextResponse.json({
            success: true,
            data: office
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Office not found' },
            { status: 404 }
        );
    }
}


export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();

        const updatedOffice = await directus.request(
            updateItem('office', params.id, {
                district_name: body.district_name,
            })
        );

        return NextResponse.json({
            success: true,
            data: updatedOffice
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update office' },
            { status: 500 }
        );
    }
}


export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await directus.request(
            deleteItem('office', params.id)
        );

        return NextResponse.json({
            success: true,
            message: 'Office deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete office' },
            { status: 500 }
        );
    }
}
