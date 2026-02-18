import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { directus, getDirectusClient } from './directus';
import { readMe, } from '@directus/sdk';

type RouteHandler = (
    req: NextRequest,
    context: { params: any }
) => Promise<NextResponse> | NextResponse;

export function withMiddleware(handler: RouteHandler) {
    return async (req: NextRequest, context: { params: any }) => {
        try {
            const cookieHandler = await cookies()
            const token = cookieHandler.get("directus_session_token")?.value;

            if (!token) {
                return NextResponse.redirect(new URL("/auth/login", req.url));
            }

            const client = getDirectusClient(token);
            const requestHeaders = new Headers(req.headers);
            let user: any;


            const userFromCookie = cookieHandler.get("logged_user")?.value;

            if (!userFromCookie) {
                user = await client.request(readMe({
                    fields: [
                        "*",
                        "office_id.*" as any,
                        "office_id.district_id.*" as any,
                        "office_id.district_id.province_id.*" as any,
                        "role.*"
                    ]
                }));
                cookieHandler.set('user_data', user, {
                    sameSite: 'lax',
                    path: '/',
                    secure: process.env.NODE_ENV === "production",
                    httpOnly: true,
                    maxAge: 60 * 1440
                });
            } else {
                user = JSON.parse(userFromCookie);
            }
            requestHeaders.set('x-user-data', JSON.stringify(user));
            requestHeaders.set('x-directus-token', token);

            const modifiedRequest = new NextRequest(req, {
                headers: requestHeaders,
            });

            // Continue to handler
            return handler(modifiedRequest, context);

        } catch (error: any) {
            console.error("Middleware auth error:", error);

            // Clear invalid session and redirect
            const response = NextResponse.redirect(new URL("/auth/login", req.url));
            response.cookies.delete("directus_session_token");
            response.cookies.delete("directus_refresh_token");
            response.cookies.delete("user_data");
            return response;
        }
    };
}