import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { directus } from './directus';
import { readMe, } from '@directus/sdk';

type RouteHandler = (
    req: NextRequest,
    context: { params: any }
) => Promise<NextResponse> | NextResponse;

export function withMiddleware(handler: RouteHandler) {
    return async (req: NextRequest, context: { params: any }) => {
        const cookieHandler = await cookies()
        const token = cookieHandler.get("directus_session_token")?.value;

        if (!token) {
            redirect("/auth/login");
        }
        directus.setToken(token)


        const userFromCookie = cookieHandler.get("logged_user")?.value;
        const requestHeaders = new Headers(req.headers);

        if (!userFromCookie) {
            const user: any = await directus.request(readMe({
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
            requestHeaders.set('x-user-data', JSON.stringify(user));


        } else {

            requestHeaders.set('x-user-data', JSON.stringify(userFromCookie));
        }
        const modifiedRequest = new NextRequest(req, {
            headers: requestHeaders,
        });


        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Continue to handler
        return handler(modifiedRequest, context);
    };
}