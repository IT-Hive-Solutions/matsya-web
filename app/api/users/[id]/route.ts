
import { getAccessToken } from "@/core/lib/auth";
import { getDirectusClient } from "@/core/lib/directus";
import { readRoles, updateUser } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    params: Promise<{
        id: string;
    }>;
};


async function patchHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json();
        const payload: any = {
            full_name: body.full_name,
            email: body.email,
            office_id: parseInt(body.office_id),
            phone_number: body.phone_number,
        }
        const token = await getAccessToken();
        const client = getDirectusClient(token!);

        if (body.userType) {
            const roles = await client.request(
                readRoles({
                    filter: {
                        name: { _eq: body.user_type } // or 'Admin', 'Member', etc.
                    }
                })
            );
            payload.role = roles[0].id
        }
        const updatedUser = await client.request(
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

export const PATCH = patchHandler
