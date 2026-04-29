import { VerificationStatus } from '@/core/enums/verification-status.enum';
import { getAccessToken } from '@/core/lib/auth';
import { getDirectusClient } from '@/core/lib/directus';
import { readItem, updateItem } from '@directus/sdk';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
    params: Promise<{
        id: string;
    }>;
};


async function getHandler(request: NextRequest, { params }: Params) {
    try {
        const token = await getAccessToken();
        const client = getDirectusClient(token!);

        const { id } = await params

        const animal = await client.request(
            readItem('animal_info', parseInt(id), { fields: ["*", "owners_id.*", "animal_type.*", "animal_category.*"] })
        );

        return NextResponse.json({
            success: true,
            data: animal
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Animal not found' },
            { status: 404 }
        );
    }
}


async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const token = await getAccessToken();
        const client = getDirectusClient(token!);


        const body = await request.json();

        const { id } = await params
        const animal = await client.request(
            readItem('animal_info', parseInt(id), { fields: ["*"] })
        );
        const updatePayload = {
            ...body,
            age_months: body.age_months,
            age_years: body.age_years,
            animal_category: body.animal_category,
            animal_type: body.animal_type,
            is_vaccination_applied: body.is_vaccination_applied,
            sero_surveillance: body.sero_surveillance,
            latitude: body.latitude,
            longitude: body.longitude,
            owners_id: body.owners_id,
            production_capacity: body.production_capacity,
            num_of_animals: body.num_of_animals,
        }

        if (animal.verification_status === VerificationStatus.Rejected
            ||
            animal.verification_status === VerificationStatus.Draft) {
            updatePayload.verification_status = VerificationStatus.Draft;
        }

        const updatedAnimal = await client.request(
            updateItem('animal_info', parseInt(id), updatePayload)
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



export const GET = getHandler
export const PUT = putHandler
