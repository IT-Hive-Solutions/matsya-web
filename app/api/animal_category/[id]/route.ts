import { NextRequest, NextResponse } from 'next/server';
import { getDirectusClient } from '@/core/lib/directus';
import { readItem, updateItem, deleteItem } from '@directus/sdk';
import { withMiddleware } from '@/core/lib/api.middleware';

type Params = {
    params: Promise<{
        id: string;
    }>;
};


async function getHandler(request: NextRequest, { params }: Params) {
    try {
        const token = request.headers.get('x-directus-token');

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }


        const directus = getDirectusClient(token);

        const { id } = await params

        const category = await directus.request(
            readItem('animal_category', parseInt(id))
        );

        return NextResponse.json({
            success: true,
            data: category
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Category not found' },
            { status: 404 }
        );
    }
}


async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const token = request.headers.get('x-directus-token');

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }


        const directus = getDirectusClient(token);

        const { id } = await params

        const body = await request.json();

        const updatedCategory = await directus.request(
            updateItem('animal_category', parseInt(id), {
                category_name: body.category_name,
            })
        );

        return NextResponse.json({
            success: true,
            data: updatedCategory
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update category' },
            { status: 500 }
        );
    }
}


async function deleteHandler(request: NextRequest, { params }: Params) {
    try {
        const token = request.headers.get('x-directus-token');

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const directus = getDirectusClient(token);

        const { id } = await params

        await directus.request(
            deleteItem('animal_category', parseInt(id))
        );

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete category' },
            { status: 500 }
        );
    }
}


export const GET = withMiddleware(getHandler)
export const PUT = withMiddleware(putHandler)
export const DELETE = withMiddleware(deleteHandler)