
import { getAccessToken } from "@/core/lib/auth";
import { getDirectusClient } from "@/core/lib/directus";
import { readRoles, updateUser } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    params: Promise<{
        id: string;
    }>;
};


async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json();
        const payload: any = {
            email: body.email,
            office_id: parseInt(body.office_id),
            phone_number: body.phone_number,
        }
        if (body?.full_name) {
            const [first_name, ...rest] = body.full_name.split(" ")
            const last_name = rest.join(" ")
            payload.first_name = first_name
            payload.last_name = last_name
        }
        const token = await getAccessToken();
        const client = getDirectusClient(token!);

        if (body.user_type) {
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

export const PUT = putHandler
