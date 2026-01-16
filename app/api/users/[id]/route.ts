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
        const user = await directus.request(
            readItem('users', params.id)
        );

        return NextResponse.json({
            success: true,
            data: user
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
        );
    }
}


export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();

        const updatedUser = await directus.request(
            updateItem('users', params.id, {
                full_name: body.full_name,
                email: body.email,
                office_id: body.office_id,
                phone_number: body.phone_number,
            })
        );

        return NextResponse.json({
            success: true,
            data: updatedUser
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update user' },
            { status: 500 }
        );
    }
}


export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await directus.request(
            deleteItem('users', params.id)
        );

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete user' },
            { status: 500 }
        );
    }
}
