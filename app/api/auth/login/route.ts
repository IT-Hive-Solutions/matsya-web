import { directus } from "@/core/lib/directus";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = await body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }
        console.log({ email, password });


        const authUser = await directus.login({ email, password })
        console.log({ authUser });


        if (!authUser.access_token) {
            return NextResponse.json(
                { error: 'Invalid Credential!' },
                { status: 401 }
            );
        }

        // Set cookies
        const cookieStore = await cookies();

        cookieStore.set('directus_session_token', authUser.access_token, {
            sameSite: 'lax',
            path: '/',
            secure: false,
            httpOnly: true, // Important for security
            maxAge: 60 * 1440 // 15 minutes (matches your token expiry)
        });

        if (authUser.refresh_token) {
            cookieStore.set('directus_refresh_token', authUser.refresh_token, {
                sameSite: 'lax',
                path: '/',
                secure: false,
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
        }
        if (authUser.expires_at) {
            cookieStore.set('directus_expires_at', authUser.expires_at.toString(), {
                sameSite: 'lax',
                path: '/',
                secure: false,
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
        }
        const response = NextResponse.json(
            {
                data: { message: 'Login successful', success: true }
            },
            { status: 200 }
        );

        return response;

    } catch (error: any) {
        console.error('Login error:', error);

        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}

