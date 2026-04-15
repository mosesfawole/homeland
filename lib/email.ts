import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_ADDRESS =
  process.env.RESEND_FROM_EMAIL ?? "Homeland <onboarding@resend.dev>";
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

interface EmailPayload {
  to?: string | null;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail({ to, subject, html, text }: EmailPayload) {
  if (!resend || !to) return;
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("[resend]", error);
  }
}

export async function sendBookingReceivedEmail(params: {
  agentEmail?: string | null;
  agentName?: string | null;
  propertyTitle: string;
  tourDate: string;
  tourTime: string;
  userName: string | null;
  bookingId: string;
}) {
  const name = params.agentName ?? "Agent";
  const subject = `New tour request for ${params.propertyTitle}`;
  const bookingLink = `${BASE_URL}/agent/bookings`;

  await sendEmail({
    to: params.agentEmail,
    subject,
    text: `Hi ${name},\n\nYou have a new tour request for ${params.propertyTitle}.\nTour: ${params.tourDate} at ${params.tourTime}.\nClient: ${params.userName ?? "A client"}.\nReview the request: ${bookingLink}\n\nBooking ID: ${params.bookingId}`,
    html: `
      <p>Hi ${name},</p>
      <p>You have a new tour request for <strong>${params.propertyTitle}</strong>.</p>
      <p><strong>Tour:</strong> ${params.tourDate} at ${params.tourTime}</p>
      <p><strong>Client:</strong> ${params.userName ?? "A client"}</p>
      <p><a href="${bookingLink}">Review the request</a></p>
      <p style="color:#64748b;font-size:12px">Booking ID: ${params.bookingId}</p>
    `,
  });
}

export async function sendBookingConfirmedEmail(params: {
  userEmail?: string | null;
  userName?: string | null;
  propertyTitle: string;
  tourDate: string;
  tourTime: string;
  bookingId: string;
}) {
  const name = params.userName ?? "there";
  const subject = `Tour confirmed for ${params.propertyTitle}`;
  const bookingLink = `${BASE_URL}/user/bookings`;

  await sendEmail({
    to: params.userEmail,
    subject,
    text: `Hi ${name},\n\nYour tour request for ${params.propertyTitle} has been confirmed.\nTour: ${params.tourDate} at ${params.tourTime}.\nTrack booking: ${bookingLink}\n\nBooking ID: ${params.bookingId}`,
    html: `
      <p>Hi ${name},</p>
      <p>Your tour request for <strong>${params.propertyTitle}</strong> has been confirmed.</p>
      <p><strong>Tour:</strong> ${params.tourDate} at ${params.tourTime}</p>
      <p><a href="${bookingLink}">Track your booking</a></p>
      <p style="color:#64748b;font-size:12px">Booking ID: ${params.bookingId}</p>
    `,
  });
}

export async function sendBookingCancelledEmail(params: {
  userEmail?: string | null;
  userName?: string | null;
  propertyTitle: string;
  tourDate: string;
  tourTime: string;
  bookingId: string;
  cancelReason?: string | null;
}) {
  const name = params.userName ?? "there";
  const subject = `Tour cancelled for ${params.propertyTitle}`;
  const bookingLink = `${BASE_URL}/user/bookings`;
  const reasonText = params.cancelReason
    ? `Reason: ${params.cancelReason}`
    : "";

  await sendEmail({
    to: params.userEmail,
    subject,
    text: `Hi ${name},\n\nYour tour for ${params.propertyTitle} has been cancelled.\nTour: ${params.tourDate} at ${params.tourTime}.\n${reasonText}\nTrack booking: ${bookingLink}\n\nBooking ID: ${params.bookingId}`,
    html: `
      <p>Hi ${name},</p>
      <p>Your tour for <strong>${params.propertyTitle}</strong> has been cancelled.</p>
      <p><strong>Tour:</strong> ${params.tourDate} at ${params.tourTime}</p>
      ${params.cancelReason ? `<p><strong>Reason:</strong> ${params.cancelReason}</p>` : ""}
      <p><a href="${bookingLink}">Track your booking</a></p>
      <p style="color:#64748b;font-size:12px">Booking ID: ${params.bookingId}</p>
    `,
  });
}

export async function sendVerificationEmail(params: {
  userEmail?: string | null;
  userName?: string | null;
  verifyUrl: string;
}) {
  if (!resend || !params.userEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[verify-email] link:", params.verifyUrl);
    }
    return;
  }

  const name = params.userName ?? "there";
  const subject = "Verify your Homeland account";

  await sendEmail({
    to: params.userEmail,
    subject,
    text: `Hi ${name},\n\nThanks for signing up on Homeland. Please verify your email by clicking the link below:\n${params.verifyUrl}\n\nIf you didn't create this account, you can ignore this email.`,
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for signing up on Homeland. Please verify your email by clicking the link below:</p>
      <p><a href="${params.verifyUrl}">Verify your email</a></p>
      <p style="color:#64748b;font-size:12px">If you didn't create this account, you can ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  userEmail?: string | null;
  userName?: string | null;
  resetUrl: string;
}) {
  if (!resend || !params.userEmail) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[password-reset] link:", params.resetUrl);
    }
    return;
  }

  const name = params.userName ?? "there";
  const subject = "Reset your Homeland password";

  await sendEmail({
    to: params.userEmail,
    subject,
    text: `Hi ${name},\n\nWe received a request to reset your password. Use the link below to set a new one:\n${params.resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Use the link below to set a new one:</p>
      <p><a href="${params.resetUrl}">Reset your password</a></p>
      <p style="color:#64748b;font-size:12px">If you didn't request this, you can ignore this email.</p>
    `,
  });
}
