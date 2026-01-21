import { directus } from "@/core/lib/directus";
import { login, readMe } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const authUser = await directus.request(
            login({
                email: email,
                password: password
            })
        )
        console.log({ authUser });


        if (!authUser.access_token) {
            return NextResponse.json(
                { error: 'Invalid Credential!' },
                { status: 401 }
            );
        }

        if (authUser.access_token) {
            await directus.setToken(authUser.access_token);
        }

        // Fetch user details
        const user = await directus.request(
            readMe({
                fields: [
                    '*',
                    'office_id.*' as any,
                    "office_id.province_id.*",
                    "office_id.district_id.*",
                ]  // No 'as any' needed
            })

        );

        console.log({ user });


        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;

        // Create session or JWT token (simplified version)
        const sessionData = {
            userId: user.id,
            phone_number: user.phone_number,
            timestamp: Date.now()
        };

        const response = NextResponse.json(
            {
                message: 'Login successful',
                data: userWithoutPassword
            },
            { status: 200 }
        );

        // Store session data in HTTP-only cookie
        response.cookies.set('user_session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400, // 24 hours
            path: '/'
        });
        response.cookies.set('access_token', JSON.stringify(authUser.access_token), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400, // 24 hours
            path: '/'
        });
        response.cookies.set('access_token', JSON.stringify(authUser.refresh_token), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400, // 24 hours
            path: '/'
        });
        response.cookies.set('access_token', JSON.stringify(authUser.expires), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400, // 24 hours
            path: '/'
        });

        return response;

    } catch (error: any) {
        console.error('Login error:', error);

        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
