
// app/api/users/route.ts
// Handles GET (all users) and POST (create item)
import { NextRequest, NextResponse } from 'next/server';
import { readItems, createItem } from '@directus/sdk';
import { directus } from '@/core/lib/directus'
import bcrypt from 'bcrypt';
import { generateSecurePassword } from '@/core/services/apiHandler/handleGeneratePassword';
import { sendMail } from '@/core/services/mail/sendMail';

// GET - Fetch all users
export async function GET(request: NextRequest) {
    try {
        const users = await directus.request(
            readItems('users', {
                fields: ['*', "office_id.*", "office_id.province_id.*", "office_id.district_id.*"],
                sort: ['-date_created'],
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

        const newUser = await directus.request(
            createItem('users', {
                full_name: body.full_name,
                email: body.email,
                password: hashedPassword,
                office_id: body.office_id,
                needs_password_change: true,
                phone_number: body.phone_number,
                user_type: body.user_type,
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

