// import { withMiddleware } from "@/core/lib/api.middleware";
// import { directus } from "@/core/lib/directus";
// import { generateSecurePassword } from "@/core/services/apiHandler/handleGeneratePassword";
// import { sendMail } from "@/core/services/mail/sendMail";
// import { readUsers, updateUser } from "@directus/sdk";
// import { NextRequest, NextResponse } from "next/server";

// async function postHandler(req: NextRequest) {
//     try {
//         const body = await req.json();
//         const {
//             email,
//             needs_password_change = false
//         } = body;

//         // Validation
//         if (!email) {
//             return NextResponse.json(
//                 { error: 'Phone number is required' },
//                 { status: 400 }
//             );
//         }

//         // Fetch user from custom users table by email
//         const user = await directus.request(readUsers({
//             filter: {
//                 email: { _eq: email }
//             }
//         })).then(res => res[0]);

//         // Check if user exists
//         if (!user) {
//             return NextResponse.json(
//                 { error: 'User with email not found' },
//                 { status: 401 }
//             );
//         }



//         const newPassword = generateSecurePassword(8);
//         const updatedUser = await directus.request(
//             updateUser(user.id, {
//                 password: newPassword,
//                 needs_password_change: needs_password_change
//             })

//         );
//         // Remove password from user object
//         const { password: _, ...userWithoutPassword } = updatedUser;

//         if (user.email) {
//             const mailInfo = await sendMail({
//                 html: `<p>Your password has been reset. Your temporary password is: <strong>${newPassword}</strong>. Use your phone number and password to login</p>
//                 <p>Please change your password after logging in for the first time.</p>`,
//                 subject: 'Your New Account Details',
//                 to: user.email,
//             })
//             console.log({ mailInfo });
//         }


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