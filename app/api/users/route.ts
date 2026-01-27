
// app/api/users/route.ts
// Handles GET (all users) and POST (create item)
import { directus } from '@/core/lib/directus';
import { generateSecurePassword } from '@/core/services/apiHandler/handleGeneratePassword';
import { sendMail } from '@/core/services/mail/sendMail';
import { createUser, readRoles, readUsers } from '@directus/sdk';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all users
export async function GET(request: NextRequest) {
    try {
        const users = await directus.request(
            readUsers({
                fields: ['*', 'office_id.*' as any, 'office_id.province_id.*' as any, 'office_id.district_id.*' as any]
            })
        );

        return NextResponse.json({
            success: true,
            data: users
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST - Create new item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.full_name) {
            return NextResponse.json(
                { success: false, error: 'Fullname is required' },
                { status: 400 }
            );
        }
        if (!body.email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        if (!body.phone_number) {
            return NextResponse.json(
                { success: false, error: 'Phone Number is required' },
                { status: 400 }
            );
        }
        if (!body.user_type) {
            return NextResponse.json(
                { success: false, error: 'User Type is required' },
                { status: 400 }
            );
        }
        if (!body.office_id) {
            return NextResponse.json(
                { success: false, error: 'Office is required' },
                { status: 400 }
            );
        }

        const newPassword = generateSecurePassword(8)
        console.log({ newPassword }); //8w!6Kszv

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)
        const [first_name, ...rest] = body.full_name.split(" ")
        const last_name = rest.join(" ")
        const roles = await directus.request(
            readRoles({
                filter: {
                    name: { _eq: body.user_type } // or 'Admin', 'Member', etc.
                }
            })
        );

        const newUser = await directus.request(
            createUser({
                first_name: first_name,
                last_name: last_name,
                email: body.email,
                password: hashedPassword,
                office_id: body.office_id,
                needs_password_change: true,
                phone_number: body.phone_number,
                user_type: body.user_type,
                role: roles[0].id,
                status: 'active',
            })
        );

        const mailInfo = await sendMail({
            html: `<p>Your account has been created. Your temporary password is: <strong>${newPassword}</strong>. Use your phone number and password to login</p>
                   <p>Please change your password after logging in for the first time.</p>`,
            subject: 'Your New Account Details',
            to: body.email,
        })
        console.log({ mailInfo });


        return NextResponse.json(
            { success: true, data: newUser },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create user' },
            { status: 500 }
        );
    }
}

