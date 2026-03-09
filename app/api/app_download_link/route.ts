// import { getAccessToken } from "@/core/lib/auth";
// import { getDirectusClient } from "@/core/lib/directus";
// import { readItems } from "@directus/sdk";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//     try {
//         const token = await getAccessToken();
//         const client = getDirectusClient(token!);

//         const app_link = await client.request(
//             readItems('app_download_link', {
//                 fields: ['*'],
//             })
//         );

//         return NextResponse.json({
//             success: true,
//             data: app_link
//         });
//     } catch (error: any) {
//         return NextResponse.json(
//             { success: false, error: error.message || 'Failed to fetch link' },
//             { status: 500 }
//         );
//     }
// }