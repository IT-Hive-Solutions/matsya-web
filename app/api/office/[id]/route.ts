import { CreateOfficeSchema } from '@/core/dtos/office.dto';
import { getAccessToken } from '@/core/lib/auth';
import { getDirectusClient } from '@/core/lib/directus';
import { createItems, readItems, updateItem, updateItems } from '@directus/sdk';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
    params: Promise<{
        id: string;
    }>;
};


// async function getHandler(request: NextRequest, { params }: Params) {
//     try {
//         const { id } = await params

//         const office = await directus.request(
//             readItem('office', parseInt(id), { fields: ["*", "district_id.*", "district_id.province_id.*"] })
//         );

//         return NextResponse.json({
//             success: true,
//             data: office
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: 'Office not found' },
//             { status: 404 }
//         );
//     }
// }


async function putHandler(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const officeId = parseInt(id);

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

        // 1. Update the office
        const updatedOffice = await client.request(
            updateItem('office', officeId, {
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

        // 2. Handle tag updates if range is provided
        let createdTags: any[] = [];
        let skippedTags: number[] = [];
        let unlinkedTags: number[] = [];

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

            const newRangeSet = new Set<number>();
            for (let n = min_assigned_tag_number; n <= max_assigned_tag_number; n++) {
                newRangeSet.add(n);
            }

            // 3. Fetch tags currently linked to this office
            const currentOfficeTags = await client.request(
                readItems('available_tag_numbers', {
                    filter: { office: { _eq: officeId } },
                    fields: ['id', 'tag_number'],
                    limit: -1,
                })
            );

            const currentTagMap = new Map<number, any>(
                currentOfficeTags.map((t: any) => [t.tag_number, t])
            );
            const currentTagNumberSet = new Set<number>(currentTagMap.keys());

            // Tags no longer in new range → unlink them (set office to null)
            const toUnlink = [...currentTagNumberSet].filter(
                (n) => !newRangeSet.has(n)
            );

            // Tag numbers in new range but not yet linked to this office → candidates for creation
            const candidateNumbers = [...newRangeSet].filter(
                (n) => !currentTagNumberSet.has(n)
            );

            // 4. Unlink removed tags (do NOT delete, just remove office association)
            if (toUnlink.length > 0) {
                const idsToUnlink = toUnlink.map((n) => currentTagMap.get(n).id);
                unlinkedTags = toUnlink;

                await client.request(
                    updateItems('available_tag_numbers', idsToUnlink, {
                        office: null,
                    })
                );
            }

            // 5. Check if candidate tag numbers already exist (assigned to another office)
            if (candidateNumbers.length > 0) {
                const conflictingTags = await client.request(
                    readItems('available_tag_numbers', {
                        filter: {
                            tag_number: { _in: candidateNumbers },
                        },
                        fields: ['tag_number'],
                        limit: -1,
                    })
                );

                const conflictSet = new Set(
                    conflictingTags.map((t: any) => t.tag_number)
                );

                const newTagNumbers = candidateNumbers.filter(
                    (n) => !conflictSet.has(n)
                );
                skippedTags = candidateNumbers.filter((n) => conflictSet.has(n));

                // 6. Batch create only truly new tags
                if (newTagNumbers.length > 0) {
                    const tagPayload = newTagNumbers.map((tag_number) => ({
                        tag_number,
                        office: officeId,
                    }));

                    createdTags = await client.request(
                        createItems('available_tag_numbers', tagPayload)
                    );
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                office: updatedOffice,
                tags: {
                    created: createdTags.length,
                    skipped: skippedTags.length,
                    skipped_tag_numbers: skippedTags,
                    unlinked: unlinkedTags.length,
                    unlinked_tag_numbers: unlinkedTags,
                },
            },
        });
    } catch (error: any) {
        console.log({ error: error.errors ?? error });

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update office' },
            { status: 500 }
        );
    }
}


// async function deleteHandler(request: NextRequest, { params }: Params) {
//     try {
//         const { id } = await params

//         await directus.request(
//             deleteItem('office', parseInt(id))
//         );

//         return NextResponse.json({
//             success: true,
//             message: 'Office deleted successfully'
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to delete office' },
//             { status: 500 }
//         );
//     }
// }

// export const GET = withMiddleware(getHandler)
// export const PUT = withMiddleware(putHandler)
// export const DELETE = withMiddleware(deleteHandler)