import { directus } from "@/core/lib/directus";
import { readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { phone_number, password } = body;

        // Validation
        if (!phone_number || !password) {
            return NextResponse.json(
                { error: 'Phone number and password are required' },
                { status: 400 }
            );
        }

        // Fetch user from custom users table by phone_number
        const users = await directus.request(
            readItems('users', {
                filter: {
                    phone_number: {
                        _eq: phone_number
                    }
                },
                fields: ['*', 'office_id.*', 'office_id.province_id.*', 'office_id.district_id.*'],
                limit: 1
            })
        );


        // Check if user exists
        if (!users || users.length === 0) {
            return NextResponse.json(
                { error: 'Invalid phone number or password' },
                { status: 401 }
            );
        }

        const user = users[0];
        console.log({ users, user });

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        console.log({ isPasswordValid });
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid Credential!' },
                { status: 401 }
            );
        }

        if (user.needs_password_change) {
            return NextResponse.json(
                { error: 'Password reset required', data: { needs_password_change: true } },
                { status: 200 }
            );
        }
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

        return response;

    } catch (error: any) {
        console.error('Login error:', error);

        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
