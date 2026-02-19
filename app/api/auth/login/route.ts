    import { directusEndpoints } from "@/core/contants/directusEndpoints";
import { setAuthCookies } from "@/core/lib/auth";
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

        const directusRes = await fetch(directusEndpoints.auth.login, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!directusRes.ok) {
            const err = await directusRes.json();
            return NextResponse.json(
                { error: err?.errors?.[0]?.message ?? "Login failed" },
                { status: directusRes.status }
            );
        }

        const { data } = await directusRes.json();
        const { access_token, refresh_token } = data;

        const response = NextResponse.json({ success: true }, { status: 200 });
        const headers = setAuthCookies(response, access_token, refresh_token);

        return NextResponse.json({
            data: {
                data: response.body,
                message: 'Login successful',
                success: true
            }
        }, { headers });


    } catch (error: any) {
        console.error('Login error:', error);

        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}

