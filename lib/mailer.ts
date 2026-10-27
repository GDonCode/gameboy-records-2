// lib/mailer.ts
// Server-only. Sends account emails through the same Gmail account the contact form uses
// (EMAIL_USER / EMAIL_PASS, where EMAIL_PASS is a Google app password).

import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set to send email.');
  }
  transporter ??= nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
}

export async function sendEmailChangeCode(to: string, code: string, displayName: string): Promise<void> {
  const name = displayName.replace(/[<>&"]/g, '');
  await getTransporter().sendMail({
    from: `"Gameboy Records" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${code} is your Gameboy Records verification code`,
    text: [
      `Hi ${name},`,
      '',
      `Your code to confirm this email address for your Gameboy Records account is: ${code}`,
      '',
      'It expires in 15 minutes. If you didn’t ask to change your email, you can ignore this message.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #16432a; max-width: 480px;">
        <p>Hi ${name},</p>
        <p>Your code to confirm this email address for your Gameboy Records account is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1a9e4a;">${code}</p>
        <p>It expires in 15 minutes. If you didn’t ask to change your email, you can ignore this message.</p>
      </div>
    `,
  });
}

export async function sendSetPasswordCode(to: string, code: string, displayName: string): Promise<void> {
  const name = displayName.replace(/[<>&"]/g, '');
  await getTransporter().sendMail({
    from: `"Gameboy Records" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${code} is your Gameboy Records verification code`,
    text: [
      `Hi ${name},`,
      '',
      `Your code to add a password to your Gameboy Records account is: ${code}`,
      '',
      'It expires in 15 minutes. If you didn’t ask for this, you can ignore this message.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #16432a; max-width: 480px;">
        <p>Hi ${name},</p>
        <p>Your code to add a password to your Gameboy Records account is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1a9e4a;">${code}</p>
        <p>It expires in 15 minutes. If you didn’t ask for this, you can ignore this message.</p>
      </div>
    `,
  });
}

/** Security notice after a password change. Sent to the account email so the owner hears about it. */
export async function sendPasswordChangedNotice(to: string, displayName: string, kind: 'changed' | 'set'): Promise<void> {
  const name = displayName.replace(/[<>&"]/g, '');
  const what = kind === 'set' ? 'A password was added to' : 'The password was changed on';
  const line = `${what} your Gameboy Records account, and you were signed out on your other devices.`;
  const help = 'If this wasn’t you, reply to this email right away so we can secure your account.';
  await getTransporter().sendMail({
    from: `"Gameboy Records" <${process.env.EMAIL_USER}>`,
    to,
    subject: kind === 'set' ? 'A password was added to your account' : 'Your password was changed',
    text: [`Hi ${name},`, '', line, '', help].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #16432a; max-width: 480px;">
        <p>Hi ${name},</p>
        <p>${line}</p>
        <p><strong>${help}</strong></p>
      </div>
    `,
  });
}
