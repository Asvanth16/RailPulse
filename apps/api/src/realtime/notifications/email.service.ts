import { Resend } from "resend";

import { env } from "../../config/env";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(env.RESEND_API_KEY);
  }

  async send(payload: EmailPayload): Promise<void> {
    try {
      await this.resend.emails.send({
        from: env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      console.log(`📧 Email sent to ${payload.to}`);
    } catch (error) {
      console.error("❌ Failed to send email:", error);

      throw error;
    }
  }
}

export const emailService = new EmailService();