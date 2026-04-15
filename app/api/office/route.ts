
import { CreateOfficeSchema } from '@/core/dtos/office.dto';
import { getAccessToken } from '@/core/lib/auth';
import { getDirectusClient } from '@/core/lib/directus';
import { createItem, createItems, readItems } from '@directus/sdk';
import { NextRequest, NextResponse } from 'next/server';

// // GET - Fetch all office
// export async function GET(request: NextRequest) {
//     try {
//         const office = await directus.request(
//             readItems('office', {
//                 fields: ['*', "province_id.*", "district_id.*"],
//                 sort: ['-date_created'],
//             })
//         );

//         return NextResponse.json({
//             success: true,
//             data: office
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to fetch office' },
//             { status: 500 }
//         );
//     }
// }

// // POST - Create new item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const parsed = CreateOfficeSchema.safeParse(body);
        if (!parsed.success) {
            const firstError = parsed.error.errors[0];
            return NextResponse.json(
                { success: false, error: firstError.message },
                { status: 400 }
            );
        }

        const {
            office_name,
            office_email,
            office_contact,
            district_id,
            province_id,
            mun_id,
            ward_number,
            min_assigned_tag_number,
            max_assigned_tag_number,
        } = parsed.data;

        const token = await getAccessToken();
        const client = getDirectusClient(token!);

        // 1. Create the office first
        const newOffice = await client.request(
            createItem('office', {
                office_name,
                office_email,
                office_contact: office_contact ?? "",
                district_id,
                province_id,
                mun_id: mun_id ?? null,
                ward_number: ward_number ?? null,
                min_assigned_tag_number: min_assigned_tag_number ?? null,
                max_assigned_tag_number: max_assigned_tag_number ?? null,
            })
        );

        // 2. Handle tag creation if range is provided
        let createdTags: any[] = [];
        let skippedTags: number[] = [];

        if (
            min_assigned_tag_number !== undefined &&
            max_assigned_tag_number !== undefined
        ) {
            // Validate 12-digit constraint
            const is12Digit = (n: number) =>
                Number.isInteger(n) &&
                n >= 100_000_000_000 &&
                n <= 999_999_999_999;

            if (!is12Digit(min_assigned_tag_number) || !is12Digit(max_assigned_tag_number)) {
                return NextResponse.json(
                    { success: false, error: "Tag numbers must be 12-digit integers (100000000000 - 999999999999)" },
                    { status: 400 }
                );
            }

            if (min_assigned_tag_number > max_assigned_tag_number) {
                return NextResponse.json(
                    { success: false, error: "min_assigned_tag_number must be less than or equal to max_assigned_tag_number" },
                    { status: 400 }
                );
            }

            // Build the full list of tag numbers in the range
            const tagNumbersInRange: number[] = [];
            for (let n = min_assigned_tag_number; n <= max_assigned_tag_number; n++) {
                tagNumbersInRange.push(n);
            }

            // Fetch already existing available_tag_numbers in this range to skip them
            const existingTags = await client.request(
                readItems('available_tag_numbers', {
                    filter: {
                        tag_number: {
                            _in: tagNumbersInRange,
                        },
                    },
                    fields: ['tag_number'],
                    limit: -1,
                })
            );

            const existingTagNumbers = new Set(
                existingTags.map((t: any) => t.tag_number)
            );

            // Separate new vs skipped
            const newTagNumbers = tagNumbersInRange.filter(
                (n) => !existingTagNumbers.has(n)
            );
            skippedTags = tagNumbersInRange.filter((n) =>
                existingTagNumbers.has(n)
            );

            // Batch create new available_tag_numbers linked to the new office
            if (newTagNumbers.length > 0) {
                const tagPayload = newTagNumbers.map((tag_number) => ({
                    tag_number,
                    office: newOffice.id, // FK -> offices.id
                }));

                createdTags = await client.request(
                    createItems('available_tag_numbers', tagPayload)
                );
            }
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    office: newOffice,
                    available_tag_numbers: {
                        created: createdTags.length,
                        skipped: skippedTags.length,
                        skipped_tag_numbers: skippedTags,
                    },
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.log({ error: error.errors ?? error });

        return NextResponse.json(
            { success: false, error: error || 'Failed to create office' },
            { status: 500 }
        );
    }
}
