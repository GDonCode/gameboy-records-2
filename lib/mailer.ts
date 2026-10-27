// lib/mailer.ts
// Server-only. Sends account emails through the same Gmail account the contact form uses
// (EMAIL_USER / EMAIL_PASS, where EMAIL_PASS is a Google app password).

import nodemailer from 'nodemailer';
import { escapeHtml } from '@/lib/support';

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

// ── SUPPORT ──────────────────────────────────────────────────────────────────
// Where support requests are delivered. Set SUPPORT_EMAIL to use a different inbox.
const SUPPORT_INBOX = () => process.env.SUPPORT_EMAIL || 'info@gameboyrecords.com';

interface SupportMailRequest {
  reference: string;
  topicLabel: string;
  subject: string;
  message: string;
  orderNumber: string | null;
}

interface SupportMailMember {
  id: string;
  email: string;
  name: string;
  points: number;
  memberSince: string;
}

const esc = escapeHtml;

/** To the support inbox. Replying to it emails the member directly. */
export async function sendSupportRequestToStaff(req: SupportMailRequest, member: SupportMailMember): Promise<void> {
  const details: [string, string][] = [
    ['Reference', req.reference],
    ['Topic', req.topicLabel],
    ...(req.orderNumber ? ([['Order number', req.orderNumber]] as [string, string][]) : []),
    ['Member', `${member.name} <${member.email}>`],
    ['Member since', member.memberSince],
    ['Points', member.points.toLocaleString('en-US')],
    ['Account id', member.id],
  ];
  await getTransporter().sendMail({
    from: `"Gameboy Records Support" <${process.env.EMAIL_USER}>`,
    to: SUPPORT_INBOX(),
    replyTo: { name: member.name, address: member.email },
    subject: `[${req.reference}] ${req.subject}`,
    text: [...details.map(([k, v]) => `${k}: ${v}`), '', req.message, '', 'Reply to this email to answer the member.'].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #16432a; max-width: 600px;">
        <table style="border-collapse: collapse; margin-bottom: 16px;">
          ${details.map(([k, v]) => `<tr><td style="padding: 2px 12px 2px 0; color: #5b7a66;">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}
        </table>
        <p style="white-space: pre-wrap; border-left: 3px solid #1a9e4a; padding-left: 12px;">${esc(req.message)}</p>
        <p style="color: #5b7a66; font-size: 13px;">Reply to this email to answer the member.</p>
      </div>
    `,
  });
}

/** To the member, so they have the reference and a copy of what they sent. */
export async function sendSupportConfirmation(req: SupportMailRequest, member: SupportMailMember): Promise<void> {
  await getTransporter().sendMail({
    from: `"Gameboy Records Support" <${process.env.EMAIL_USER}>`,
    to: member.email,
    replyTo: SUPPORT_INBOX(),
    subject: `We got your message [${req.reference}]`,
    text: [
      `Hi ${member.name},`,
      '',
      `Thanks for getting in touch. Your reference is ${req.reference}. We'll reply to this email address.`,
      '',
      `Subject: ${req.subject}`,
      '',
      req.message,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #16432a; max-width: 600px;">
        <p>Hi ${esc(member.name)},</p>
        <p>Thanks for getting in touch. Your reference is <strong>${esc(req.reference)}</strong>. We'll reply to this email address.</p>
        <p style="color: #5b7a66;">Subject: ${esc(req.subject)}</p>
        <p style="white-space: pre-wrap; border-left: 3px solid #1a9e4a; padding-left: 12px;">${esc(req.message)}</p>
      </div>
    `,
  });
}
