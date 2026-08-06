import { emailService } from "./email.service";

export interface NotificationPayload {
  userId: string;

  email: string;

  firstName: string;

  title: string;

  trainNumber: string;

  stationName: string;

  delayMinutes: number;
}

export class NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    console.log("=================================");
    console.log("🔔 Notification");
    console.log(`User    : ${payload.userId}`);
    console.log(`Email   : ${payload.email}`);
    console.log(`Title   : ${payload.title}`);
    console.log(`Train   : ${payload.trainNumber}`);
    console.log(`Station : ${payload.stationName}`);
    console.log(`Delay   : ${payload.delayMinutes} minute(s)`);
    console.log("=================================");

    await emailService.send({
      to: payload.email,
      subject: payload.title,
      html: `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, Helvetica, sans-serif; background:#f4f4f4; padding:30px;">
    <div style="max-width:600px; margin:auto; background:white; border-radius:10px; padding:30px;">

      <h1 style="color:#0f62fe; margin-bottom:0;">
        🚆 RailPulse
      </h1>

      <p style="color:#666;">
        Real-Time Train Notification
      </p>

      <hr />

      <h2>${payload.title}</h2>

      <p>
        Hello <strong>${payload.firstName}</strong>,
      </p>

      <p>
        Your train has a new realtime update.
      </p>

      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td><strong>Train</strong></td>
          <td>${payload.trainNumber}</td>
        </tr>

        <tr>
          <td><strong>Station</strong></td>
          <td>${payload.stationName}</td>
        </tr>

        <tr>
          <td><strong>Current Delay</strong></td>
          <td>${payload.delayMinutes} minute(s)</td>
        </tr>
      </table>

      <br />

      <p>
        We will continue monitoring your journey and notify you if there are further important changes.
      </p>

      <hr />

      <p style="color:#777;">
        Thank you,<br />
        <strong>RailPulse Team</strong>
      </p>

    </div>
  </body>
</html>
      `,
    });
  }
}

export const notificationService = new NotificationService();
