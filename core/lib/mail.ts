import nodemailer from 'nodemailer';

export async function createMailTransporter() {
  // if (process.env.NODE_ENV === 'development') {
  //   // Create a test account automatically (Ethereal Email)
  //   const testAccount = await nodemailer.createTestAccount();

  //   return nodemailer.createTransport({
  //     host: 'smtp.ethereal.email',
  //     port: 587,
  //     secure: false,
  //     auth: {
  //       user: testAccount.user,
  //       pass: testAccount.pass,
  //     },
  //   });
  // } else {
    // Production SMTP settings (configure when ready)
    console.log({ user: process.env.SMTP_USER });
    console.log({ pass: process.env.SMTP_PASS });

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  // }
}

