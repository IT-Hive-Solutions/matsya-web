import { getUserData } from "@/core/lib/dal";
import { directus } from "@/core/lib/directus";
import { login, readMe } from "@directus/sdk";
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
            (await cookies()).set('directus_session_token', authUser.access_token, { sameSite: 'strict', path: '/', secure: true, expires: 8640000 });
        }
        // if (authUser.refresh_token) {
        //     (await cookies()).set('directus_refresh_token', authUser.refresh_token, { sameSite: 'strict', path: '/', secure: true, expires: 8640000 });
        // }

        // Fetch user details
        const { user } = await getUserData(true)

        console.log({ user });


        const response = NextResponse.json(
            {
                message: 'Login successful',
                data: user
            },
            { status: 200 }
        );


        response.cookies.set('directus_session_token', JSON.stringify(authUser.access_token), {
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

// export async function POST(request: NextRequest) {
//     const formData = await request.formData();

//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;

//     if (!email || !password) {
//         return NextResponse.json({ error: "All fields are required" }, { status: 400 });
//     }

//     try {
//         const response = await directus.login({ email, password });
//         console.log(response);
//         if (response.access_token) {
//             (await cookies()).set('directus_session_token', response.access_token, { sameSite: 'strict', path: '/', secure: true })
//         }
//         const url = request.nextUrl.clone();
//         url.pathname = "/"
//         return NextResponse.redirect(url);
//     } catch (error) {
//         console.log(error);
//         return NextResponse.json({ error: "Login failed" }, { status: 500 });
//     }
// }
