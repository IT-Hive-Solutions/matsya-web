
// import { NextRequest, NextResponse } from 'next/server';
// import { readItems, createItem } from '@directus/sdk';
// import { directus } from '@/core/lib/directus'
// import { withMiddleware } from '@/core/lib/api.middleware';

// // GET - Fetch all province
// async function getHandler(request: NextRequest) {
//     try {
//         const province = await directus.request(
//             readItems('province', {
//                 fields: ['*'],
//                 sort: ['-date_created'],
//             })
//         );

//         return NextResponse.json({
//             success: true,
//             data: province
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to fetch province' },
//             { status: 500 }
//         );
//     }
// }

// // POST - Create new item
// async function postHandler(request: NextRequest) {
//     try {
//         const body = await request.json();

//         if (!body.province_name) {
//             return NextResponse.json(
//                 { success: false, error: 'Name is required' },
//                 { status: 400 }
//             );
//         }

//         const newProvince = await directus.request(
//             createItem('province', {
//                 province_name: body.province_name,
//             })
//         );

//         return NextResponse.json(
//             { success: true, data: newProvince },
//             { status: 201 }
//         );
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to create province' },
//             { status: 500 }
//         );
//     }
// }

// export const GET = withMiddleware(getHandler)
// export const POST = withMiddleware(postHandler)
