import { directus } from "@/core/lib/directus";
import { readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const app_link = await directus.request(
            readItems('app_download_link', {
                fields: ['*'],
            })
        );

        return NextResponse.json({
            success: true,
            data: app_link
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch link' },
            { status: 500 }
        );
    }
}