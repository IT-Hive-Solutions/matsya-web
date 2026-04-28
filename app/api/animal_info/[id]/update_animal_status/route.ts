import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { getAccessToken } from "@/core/lib/auth";
import { getDirectusClient } from "@/core/lib/directus";
import { sendNotificationDirect } from "@/core/lib/notification-sender";
import { updateItem } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const token = await getAccessToken();
        const client = getDirectusClient(token!);

        const body = await request.json();

        const { id } = await params
        if (body.verification_status === VerificationStatus.Rejected && !body?.rejection_reason) {
            return NextResponse.json({
                success: false,
                data: null,
                error: "Reason is required for rejection!"
            });
        }
        const updatedAnimal = await client.request(
            updateItem('animal_info', parseInt(id), {
                verification_status: body.verification_status,
                rejection_reason: body?.rejection_reason ?? ""
            })
        );

        if (body?.verification_status === VerificationStatus.Rejected) {

            await sendNotificationDirect({
                userId: updatedAnimal.user_created,
                title: "Animal Verification Update",
                body: `Your animal submission has been rejected. Reason: ${body.rejection_reason}`,
                type: "alert",
                data: {
                    animalId: id,
                    status: body.verification_status
                }
            });

        }
        // console.log({ updatedAnimal });


        return NextResponse.json({
            success: true,
            data: updatedAnimal
        });
    } catch (error: any) {
        console.log({ error });

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update animal' },
            { status: 500 }
        );
    }
}

export const PUT = putHandler
