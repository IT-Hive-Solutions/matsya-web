
// import { NextRequest, NextResponse } from 'next/server';
// import { readItems, createItem } from '@directus/sdk';
// import { directus } from '@/core/lib/directus'

// // GET - Fetch all owners_info
// export async function GET(request: NextRequest) {
//     try {
//         const owners_info = await directus.request(
//             readItems('owners_info', {
//                 fields: ['*'],
//                 sort: ['-date_created'],
//             })
//         );

//         return NextResponse.json({
//             success: true,
//             data: owners_info
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to fetch Owner' },
//             { status: 500 }
//         );
//     }
// }

// // POST - Create new item
// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();

//         if (!body.owners_name) {
//             return NextResponse.json(
//                 { success: false, error: 'Name is required' },
//                 { status: 400 }
//             );
//         }
//         if (!body.owners_contact) {
//             return NextResponse.json(
//                 { success: false, error: 'Contact is required' },
//                 { status: 400 }
//             );
//         }
//         if (!body.ward_number) {
//             return NextResponse.json(
//                 { success: false, error: 'Ward is required' },
//                 { status: 400 }
//             );
//         }
//         if (!body.district) {
//             return NextResponse.json(
//                 { success: false, error: 'District is required' },
//                 { status: 400 }
//             );
//         }

//         const newOffice = await directus.request(
//             createItem('owners_info', {
//                 owners_name: body.owners_name,
//                 owners_contact: body.owners_contact,
//                 ward_number: body.ward_number,
//                 district_id: body.district,
//                 local_level_name: body.local_level_name,
//                 date: body.date,
//             })
//         );

//         return NextResponse.json(
//             { success: true, data: newOffice },
//             { status: 201 }
//         );
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to create owner' },
//             { status: 500 }
//         );
//     }
// }

