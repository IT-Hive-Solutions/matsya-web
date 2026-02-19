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
//     try {
//         const { id } = await params

//         const production_capacity = await directus.request(
//             readItem('production_capacity', parseInt(id))
//         );

//         return NextResponse.json({
//             success: true,
//             data: production_capacity
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: 'Capacity not found' },
//             { status: 404 }
//         );
//     }
// }


// async function putHandler(request: NextRequest, { params }: Params) {
//     try {
//         const body = await request.json();

//         const { id } = await params

//         const updatedCapacity = await directus.request(
//             updateItem('production_capacity', parseInt(id), {
//                 capacity_name: body.capacity_name,
//             })
//         );

//         return NextResponse.json({
//             success: true,
//             data: updatedCapacity
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to update capacity' },
//             { status: 500 }
//         );
//     }
// }


// async function deleteHandler(request: NextRequest, { params }: Params) {
//     try {
//         const { id } = await params

//         await directus.request(
//             deleteItem('production_capacity', parseInt(id))
//         );

//         return NextResponse.json({
//             success: true,
//             message: 'Capacity deleted successfully'
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to delete owner' },
//             { status: 500 }
//         );
//     }
// }


// export const GET = withMiddleware(getHandler)
// export const PUT = withMiddleware(putHandler)
// export const DELETE = withMiddleware(deleteHandler)