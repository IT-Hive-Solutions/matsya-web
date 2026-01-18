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
        const province = await directus.request(
            readItem('province', params.id)
        );

        return NextResponse.json({
            success: true,
            data: province
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Province not found' },
            { status: 404 }
        );
    }
}


export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();

        const updatedProvince = await directus.request(
            updateItem('province', params.id, {
                province_name: body.province_name,
            })
        );

        return NextResponse.json({
            success: true,
            data: updatedProvince
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update province' },
            { status: 500 }
        );
    }
}


export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await directus.request(
            deleteItem('province', params.id)
        );

        return NextResponse.json({
            success: true,
            message: 'Province deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete province' },
            { status: 500 }
        );
    }
}
