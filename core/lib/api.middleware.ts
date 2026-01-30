import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { directus } from './directus';

type RouteHandler = (
    req: NextRequest,
    context: { params: any }
) => Promise<NextResponse> | NextResponse;

export function withMiddleware(handler: RouteHandler) {
    return async (req: NextRequest, context: { params: any }) => {
        const token = (await cookies()).get("directus_session_token")?.value;
        console.log({ token });

        if (!token) {
            redirect("/auth/login");
        }
        console.log("Before Setting!!");

        directus.setToken(token)
        
        console.log(`${req.method} ${req.url}`);


        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Continue to handler
        return handler(req, context);
    };
}