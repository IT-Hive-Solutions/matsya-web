import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { AuthenticatedRequest, withMiddleware } from "@/core/lib/api.middleware";
import { readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: AuthenticatedRequest) {
    try {

        const animals = await request.directus.request(
            readItems('animal_info', {
                fields: ['*'],
                sort: ['-date_created'],
            })
        );

        const payload = {
            total_animals: animals.length ?? 0,
            total_vaccinated: animals.filter((animal) => animal.is_vaccination_applied).length ?? 0,
            pending_entries: animals.filter((animals) => animals.verification_status === VerificationStatus.Pending).length ?? 0,
        }

        return NextResponse.json({
            success: true,
            data: payload
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch report' },
            { status: 500 }
        );
    }
}

export const GET = withMiddleware(getHandler)
