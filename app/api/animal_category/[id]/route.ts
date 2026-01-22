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


export async function PUT(request: NextRequest, { params }: Params) {
    try {
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


export async function DELETE(request: NextRequest, { params }: Params) {
    try {
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
