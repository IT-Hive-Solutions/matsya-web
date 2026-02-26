import { DIRECTUS_BASE_URL } from '@/core/contants/directusEndpoints';
import { getAccessToken } from '@/core/lib/auth';
import { getDirectusClient } from '@/core/lib/directus';
import { readAssetRaw, readFile } from '@directus/sdk';
import { NextRequest, NextResponse } from 'next/server';


type Params = {
    params: Promise<{
        id: string;
    }>;
};

type QueryParams = {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
};


export async function GET(
    request: NextRequest,
    { params }: Params,

) {
    
    const { id } = await params;

    console.log({ id });

    try {
        const token = await getAccessToken();
        const client = getDirectusClient(token!);
        const metadata = await client.request(readFile(id));
        const contentType = metadata.type || 'image/jpeg';
        const stream = await client.request(readAssetRaw(id));

        // ✅ Convert ReadableStream to Buffer
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
        }

        const buffer = Buffer.concat(chunks);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });




    } catch (error) {
        return new NextResponse('Failed to fetch image', { status: 500 });
    }
}