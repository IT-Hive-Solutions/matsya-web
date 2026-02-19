// import { NextRequest, NextResponse } from 'next/server';
// import { directus } from '@/core/lib/directus';
// import { readItem, updateItem, deleteItem } from '@directus/sdk';
// import { withMiddleware } from '@/core/lib/api.middleware';
// type Params = {
//     params: Promise<{
//         id: string;
//     }>;
// };


// async function getHandler(request: NextRequest, { params }: Params) {
//     const { id } = await params

//     try {
//         const district = await directus.request(
//             readItem('district', parseInt(id), {
//                 fields: ["*", "province_id.*"]
//             })
//         );

//         return NextResponse.json({
//             success: true,
//             data: district
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: 'District not found' },
//             { status: 404 }
//         );
//     }
// }


// async function putHandler(request: NextRequest, { params }: Params) {
//     try {
//         const body = await request.json();
//         const { id } = await params
//         const updatedDistrict = await directus.request(
//             updateItem('district', parseInt(id), {
//                 district_name: body.district_name,
//             })
//         );

//         return NextResponse.json({
//             success: true,
//             data: updatedDistrict
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to update district' },
//             { status: 500 }
//         );
//     }
// }


// async function deleteHandler(request: NextRequest, { params }: Params) {

//     try {
//         const { id } = await params

//         await directus.request(
//             deleteItem('district', parseInt(id))
//         );

//         return NextResponse.json({
//             success: true,
//             message: 'District deleted successfully'
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to delete district' },
//             { status: 500 }
//         );
//     }
// }

// export const GET = withMiddleware(getHandler)
// export const PUT = withMiddleware(putHandler)
// export const DELETE = withMiddleware(deleteHandler)
