import { directus } from "@/core/lib/directus";
import { updateItem } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();

        const { id } = await params

        const updatedAnimal = await directus.request(
            updateItem('animal_info', parseInt(id), {
                verification_status: body.verification_status
            })
        );

        return NextResponse.json({
            success: true,
            data: updatedAnimal
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update animal' },
            { status: 500 }
        );
    }
}