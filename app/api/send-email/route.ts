import { sendEmail } from "@/lib/sendEmail";
import inviteUserTemplate from "@/app/components/notification-templates/invite-user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { to, subject, information, template } = await req.json();

  // Use specialized invite template for invites, otherwise build a simple HTML fallback
  let html: string;
  if (template === "invite") {
    const tpl = inviteUserTemplate(information);
    html = tpl.html;
  } else if (template === "otp_verification") {
    html = `<p>Your OTP is: <strong>${information.otp}</strong></p>`;
  } else {
    html = `<p>${information.message}</p>`;
  }

  const response = await sendEmail(to, subject, html);

  return NextResponse.json(response);
}
