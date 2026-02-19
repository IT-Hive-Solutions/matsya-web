// import { withMiddleware } from "@/core/lib/api.middleware";
// import { directus } from "@/core/lib/directus";
// import { login, readUsers, updateUser } from "@directus/sdk";
// import { NextRequest, NextResponse } from "next/server";

// async function postHandler(req: NextRequest) {
//     try {
//         const body = await req.json();
//         const {
//             email,
//             old_password,
//             new_password,
//         } = body;

//         // Validation
//         if (!email || !old_password || !new_password) {
//             return NextResponse.json(
//                 { error: 'Phone number and password are required' },
//                 { status: 400 }
//             );
//         }

//         // Fetch user from custom users table by email
//         const verification = await directus.login(
//             email,
//             old_password,
//         );


//         // Check if user exists
//         if (!verification) {
//             return NextResponse.json(
//                 { error: 'Invalid email or password' },
//                 { status: 401 }
//             );
//         }
//         const user = await directus.request(readUsers({
//             filter: {
//                 email: { _eq: email }
//             }
//         })).then(res => res[0]);


//         const updatedUser = await directus.request(
//             updateUser(user.id, {
//                 password: new_password,
//                 needs_password_change: false
//             })

//         );
//         // Remove password from user object
//         const { password: _, ...userWithoutPassword } = updatedUser;


//         const response = NextResponse.json(
//             {
//                 message: 'Password Change successful',
//                 data: {
//                     password_changed: true,
//                     ...userWithoutPassword
//                 }
//             },
//             { status: 200 }
//         );



//         return response;

//     } catch (error: any) {
//         console.error('Login error:', error);

//         return NextResponse.json(
//             { error: 'Login failed. Please try again.' },
//             { status: 500 }
//         );
//     }
// }

// export const POST = withMiddleware(postHandler)