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

        const office = await directus.request(
            readItem('office', parseInt(id))
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


async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const body = await request.json();

        const updatedOffice = await directus.request(
            updateItem('office', parseInt(id), {
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


async function deleteHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        await directus.request(
            deleteItem('office', parseInt(id))
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

export const GET = withMiddleware(getHandler)
export const PUT = withMiddleware(putHandler)
export const DELETE = withMiddleware(deleteHandler)