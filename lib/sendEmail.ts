import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  const provider = process.env.MAIL_PROVIDER || "sendgrid";

  let transporterConfig: any;

  switch (provider) {
    case "mailpit": // Local email testing tool
      transporterConfig = {
        host: process.env.MAIL_HOST || "localhost",
        port: Number(process.env.MAIL_PORT) || 1025,
        secure: false, // Mailpit does not use TLS
      };
      break;

    default:
      throw new Error(`Unknown MAIL_PROVIDER: ${provider}`);
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  const mailOptions: any = {
    from: process.env.MAIL_FROM || '"Noolor" <no-reply@noolor.com>',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Send error:", error);
    return { success: false, error };
  }
}
