import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { withMiddleware } from "@/core/lib/api.middleware";
import { directus } from "@/core/lib/directus";
import { createItem, createItems, readItems, updateItem } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

async function postHandler(request: NextRequest) {
    try {
        const body = await request.json();

        if (body.owners_contact) {
            const owner = await directus.request(
                readItems('owners_info', {
                    filter: {
                        owners_contact: {
                            _eq: body.owners_contact
                        }
                    }
                })
            )
            if (!owner[0]) {

                if (!body.owners_name) {
                    return NextResponse.json(
                        { success: false, error: 'Name is required' },
                        { status: 400 }
                    );
                }
                if (!body.district_id) {
                    return NextResponse.json(
                        { success: false, error: 'District is required' },
                        { status: 400 }
                    );
                }
                if (!body.localLevelName) {
                    return NextResponse.json(
                        { success: false, error: 'Local Level is required' },
                        { status: 400 }
                    );
                }
                if (!body.municipality) {
                    return NextResponse.json(
                        { success: false, error: 'Municipality is required' },
                        { status: 400 }
                    );
                }
                const payload = {
                    owners_name: body.owners_name,
                    owners_contact: body.owners_contact,
                    ward_number: body.ward_number,
                    district_id: body.district_id,
                    local_level_name: body.localLevelName,
                    date: body.date,
                    latitude: body.latitude,
                    municipality: body.municipality,
                    longitude: body.longitude,
                    status: "published" as "published"
                }
                const newOwner = await directus.request(
                    createItem('owners_info', payload)
                );
                if (!newOwner) {
                    return NextResponse.json(
                        { success: false, error: 'Owner Creation failed!' },
                        { status: 404 }
                    );
                }
                body.owner_id = newOwner.id;
            } else {

                const updatePayload: any = {
                    status: "published" as "published"
                }
                if (body.province_id) {
                    updatePayload.province_id = body.province_id
                }
                if (body.district_id) {
                    updatePayload.district_id = body.district_id
                }
                if (body.municipality) {
                    updatePayload.municipality = body.municipality
                }
                if (body.localLevelName) {
                    updatePayload.local_level_name = body.localLevelName
                }
                if (body.latitude) {
                    updatePayload.latitude = body.latitude
                }
                if (body.longitude) {
                    updatePayload.longitude = body.longitude
                }

                const updatedOwner = await directus.request(
                    updateItem('owners_info', parseInt(String(owner[0].id)), updatePayload)
                );
                if (!updatedOwner) {
                    return NextResponse.json(
                        { success: false, error: 'Owner Update failed!' },
                        { status: 404 }
                    );
                }
                body.owners_id = updatedOwner.id;

            }
        }
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
                owners_id: body.owners_id,
                image: animal.tag_image,
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