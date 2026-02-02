import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { withMiddleware } from "@/core/lib/api.middleware";
import { directus } from "@/core/lib/directus";
import { createItems, readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

async function postHandler(request: NextRequest) {
    try {
        const body = await request.json();

        const owner = await directus.request(
            readItems('owners_info', {
                filter: {
                    owners_contact: {
                        _eq: body.owners_contact
                    }
                }
            })
        )
        if (owner.length < 0) {
            return NextResponse.json(
                { success: false, error: 'Owner Not Found!' },
                { status: 404 }
            );
        }
        const owner_id = owner[0].id;
        const animalLists = body?.cattleEntries ?? []
        let payload: any[] = []
        if (animalLists.length > 0) {
            const data = animalLists.map((animal: any) => ({
                animal_category: animal.animal_category,
                animal_type: animal.animal_type,
                age_months: animal.age_months,
                age_years: animal.age_years,
                tag_number: animal.tag_number,
                verification_status: VerificationStatus.Pending,
                is_vaccination_applied: animal.is_vaccination_applied,
                production_capacity: animal.production_capacity,
                latitude: body.latitude,
                longitude: body.longitude,
                owners_id: owner_id,
            }));

            payload = data
        }


        const newAnimals = await directus.request(
            createItems('animal_info', payload)
        );

        return NextResponse.json(
            { success: true, data: newAnimals },
            { status: 201 }
        );
    } catch (error: any) {
        console.log("errorrrr: ", error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create animal' },
            { status: 500 }
        );
    }
}

export const POST = withMiddleware(postHandler)