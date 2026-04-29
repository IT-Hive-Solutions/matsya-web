import { directusEndpoints } from "@/core/contants/directusEndpoints";
import { setAuthCookies } from "@/core/lib/auth";
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

        const directusRes = await fetch(directusEndpoints.auth.login, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),

        });

        if (!directusRes.ok) {
            const errorText = await directusRes.text(); // Read as raw string first
            let errorMessage = `Login failed with status ${directusRes.status}`;
            try {
                // Try to parse it as JSON
                const errJson = JSON.parse(errorText);
                errorMessage = errJson?.errors?.[0]?.message ?? errorMessage;
            } catch (parseError) {
                // If it crashes, it means Directus returned HTML (e.g., 502/404 page)
                console.error("Directus returned non-JSON error:", errorText);
            }
            return NextResponse.json(
                { error: errorMessage },
                { status: directusRes.status }
            );
        }

        const { data } = await directusRes.json();
        console.log("logged in data::::", { data });

        const { access_token, refresh_token, expires } = data;

        const response = NextResponse.json({ success: true }, { status: 200 });
        const headers = setAuthCookies(response, access_token, refresh_token, expires);

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

