import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/core/lib/directus';
import { readItem, updateItem, deleteItem } from '@directus/sdk';
import { withMiddleware } from '@/core/lib/api.middleware';
type Params = {
    params: Promise<{
        id: string;
    }>;
};


async function getHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const province = await directus.request(
            readItem('province', parseInt(id))
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


async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json();

        const updatedProvince = await directus.request(
            updateItem('province', parseInt(id), {
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


async function deleteHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        await directus.request(
            deleteItem('province', parseInt(id))
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
export const GET = withMiddleware(getHandler)
export const PUT = withMiddleware(putHandler)
export const DELETE = withMiddleware(deleteHandler)