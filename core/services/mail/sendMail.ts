import { createMailTransporter } from "@/core/lib/mail";
import nodemailer from 'nodemailer';

export const sendMail = async ({ html, subject, to }: { to: string, subject: string, html: string }) => {
    const transporter = await createMailTransporter();

    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"My App" <noreply@myapp.com>',
        to,
        subject,
        html,
    });

    if (process.env.NODE_ENV === 'development') {
        console.log(' Email sent!');
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;

}