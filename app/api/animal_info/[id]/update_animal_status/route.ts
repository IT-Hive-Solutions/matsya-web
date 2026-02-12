import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { withMiddleware } from "@/core/lib/api.middleware";
import { directus } from "@/core/lib/directus";
import { updateItem } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const body = await request.json();

        const { id } = await params
        if (body.verification_status === VerificationStatus.Rejected && !body?.rejection_reason) {
            return NextResponse.json({
                success: false,
                data: null,
                error: "Reason is required for rejection!"
            });
        }
        const updatedAnimal = await directus.request(
            updateItem('animal_info', parseInt(id), {
                verification_status: body.verification_status,
                rejection_reason: body?.rejection_reason ?? ""
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

export const PUT = withMiddleware(putHandler)
