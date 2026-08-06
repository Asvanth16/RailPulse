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
    const { data, error } = await this.resend.emails.send({
      from: env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error("❌ Resend Error:");
      console.error(error);

      throw new Error(error.message);
    }

    console.log(`📧 Email accepted by Resend (ID: ${data?.id})`);
  }
}

export const emailService = new EmailService();
