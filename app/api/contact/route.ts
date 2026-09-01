import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Validate
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Configure your email transporter (example using Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // e.g., 'your-email@gmail.com'
        pass: process.env.EMAIL_PASS, // App password or regular password
      },
    });

    const mailOptions = {
      from: `"Gameboy Records Contact" <${process.env.EMAIL_USER}>`,
      to: 'info@gameboyrecords.com',
      subject: `New message from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message:
        ${message}
      `,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}