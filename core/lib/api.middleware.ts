import { DirectusClient, readMe, RestClient, StaticTokenClient } from '@directus/sdk';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { cookieConfig } from '../contants/cookie.config';
import { getDirectusClient, Schema } from './directus';


export interface AuthenticatedRequest extends NextRequest {
    directus: DirectusClient<Schema> & StaticTokenClient<Schema> & RestClient<Schema>

}
type RouteHandler = (
    req: AuthenticatedRequest,
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
                    ...cookieConfig,
                    maxAge: 60 * 1440
                });
            } else {
                user = JSON.parse(userFromCookie);
            }
            requestHeaders.set('x-user-data', JSON.stringify(user));

            const authenticatedReq = new NextRequest(req, {
                headers: requestHeaders,
            }) as AuthenticatedRequest;
            authenticatedReq.directus = client;


            // Continue to handler
            return handler(authenticatedReq, context);

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