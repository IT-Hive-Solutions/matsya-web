
// // app/api/animal_category/route.ts
// // Handles GET (all animal_category) and POST (create item)
// import { NextRequest, NextResponse } from 'next/server';
// import { readItems, createItem } from '@directus/sdk';
// import { directus } from '@/core/lib/directus'

// // GET - Fetch all animal_category
// export async function GET(request: NextRequest) {
//     try {
//         const animal_category = await directus.request(
//             readItems('animal_category', {
//                 fields: ['*'],
//                 sort: ['-date_created'],
//             })
//         );

//         return NextResponse.json({
//             success: true,
//             data: animal_category
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to fetch category' },
//             { status: 500 }
//         );
//     }
// }

// // POST - Create new item
// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();

//         if (!body.category_name) {
//             return NextResponse.json(
//                 { success: false, error: 'Name is required' },
//                 { status: 400 }
//             );
//         }

//         const newCategory = await directus.request(
//             createItem('animal_category', {
//                 category_name: body.category_name,
//             })
//         );

//         return NextResponse.json(
//             { success: true, data: newCategory },
//             { status: 201 }
//         );
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to create category' },
//             { status: 500 }
//         );
//     }
// }

