import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/core/lib/directus';
import { readItem, updateItem, deleteItem, deleteUser, readUser, updateUser, readRoles } from '@directus/sdk';
import { withMiddleware } from '@/core/lib/api.middleware';

type Params = {
    params: Promise<{
        id: string;
    }>;
};


async function getHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        const user = await directus.request(
            readUser(id, { fields: ["*", " office_id.*", " role.*" as any] })
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


async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json();
        const payload: any = {
            full_name: body.full_name,
            email: body.email,
            office_id: parseInt(body.office_id),
            phone_number: body.phone_number,
        }
        if (body.userType) {
            const roles = await directus.request(
                readRoles({
                    filter: {
                        name: { _eq: body.user_type } // or 'Admin', 'Member', etc.
                    }
                })
            );
            payload.role = roles[0].id
        }
        const updatedUser = await directus.request(
            updateUser(id, payload)
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


async function deleteHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params

        await directus.request(
            deleteUser(id)
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

export const GET = withMiddleware(getHandler)
export const PUT = withMiddleware(putHandler)
export const DELETE = withMiddleware(deleteHandler)