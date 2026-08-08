import { BrevoClient } from "@getbrevo/brevo";

import { env } from "../../config/env";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private readonly brevo: BrevoClient;

  constructor() {
    this.brevo = new BrevoClient({
      apiKey: env.BREVO_API_KEY,
    });
  }

  async send(payload: EmailPayload): Promise<void> {
    try {
      const response =
        await this.brevo.transactionalEmails.sendTransacEmail({
          sender: {
            email: env.EMAIL_FROM,
            name: "RailPulse",
          },
          to: [
            {
              email: payload.to,
            },
          ],
          subject: payload.subject,
          htmlContent: payload.html,
        });

      console.log(
        `📧 Email accepted by Brevo (ID: ${response.messageId})`,
      );
    } catch (error) {
      console.error(
        "❌ Failed to send email through Brevo:",
        error,
      );

      throw error;
    }
  }
}

export const emailService = new EmailService();