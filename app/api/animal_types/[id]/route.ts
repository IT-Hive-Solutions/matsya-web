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

        const type = await directus.request(
            readItem('animal_types', parseInt(id))
        );

        return NextResponse.json({
            success: true,
            data: type
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Type not found' },
            { status: 404 }
        );
    }
}


async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();

        const { id } = await params

        const updatedType = await directus.request(
            updateItem('animal_types', parseInt(id), {
                animal_name: body.animal_name,
            })
        );

        return NextResponse.json({
            success: true,
            data: updatedType
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update type' },
            { status: 500 }
        );
    }
}


async function deleteHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        await directus.request(
            deleteItem('animal_types', parseInt(id))
        );

        return NextResponse.json({
            success: true,
            message: 'Type deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete type' },
            { status: 500 }
        );
    }
}


export const GET = withMiddleware(getHandler)
export const PUT = withMiddleware(putHandler)
export const DELETE = withMiddleware(deleteHandler)