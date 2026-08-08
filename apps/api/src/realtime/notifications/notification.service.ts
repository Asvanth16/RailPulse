import { emailService } from "./email.service";

export interface NotificationPayload {
  userId: string;

  email: string;

  firstName: string;

  title: string;

  trainNumber: string;

  stationName: string;

  delayMinutes?: number;

  plannedPlatform?: string | number;

  actualPlatform?: string | number;

  cancelled?: boolean;

  reminderMinutes?: number;

  departureTime?: string;

  arrivalTime?: string;
}

export class NotificationService {
  async sendDelay(payload: NotificationPayload): Promise<void> {
    console.log("=================================");
    console.log("🔔 Delay Notification");
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

  async sendPlatform(payload: NotificationPayload): Promise<void> {
    console.log("=================================");
    console.log("🚉 Platform Notification");
    console.log(`User     : ${payload.userId}`);
    console.log(`Email    : ${payload.email}`);
    console.log(`Title    : ${payload.title}`);
    console.log(`Train    : ${payload.trainNumber}`);
    console.log(`Station  : ${payload.stationName}`);
    console.log(
      `Platform : ${payload.plannedPlatform} → ${payload.actualPlatform}`,
    );
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
        Real-Time Platform Notification
      </p>

      <hr />

      <h2>${payload.title}</h2>

      <p>
        Hello <strong>${payload.firstName}</strong>,
      </p>

      <p>
        Your train platform has changed.
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
          <td><strong>Old Platform</strong></td>
          <td>${payload.plannedPlatform}</td>
        </tr>

        <tr>
          <td><strong>New Platform</strong></td>
          <td>${payload.actualPlatform}</td>
        </tr>
      </table>

      <br />

      <p>
        Please check the station display boards before boarding your train.
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

  async sendCancellation(payload: NotificationPayload): Promise<void> {
    console.log("=================================");
    console.log("❌ Cancellation Notification");
    console.log(`User     : ${payload.userId}`);
    console.log(`Email    : ${payload.email}`);
    console.log(`Title    : ${payload.title}`);
    console.log(`Train    : ${payload.trainNumber}`);
    console.log(`Station  : ${payload.stationName}`);
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
        Real-Time Cancellation Notification
      </p>

      <hr />

      <h2>${payload.title}</h2>

      <p>
        Hello <strong>${payload.firstName}</strong>,
      </p>

      <p>
        Unfortunately, your monitored train has been cancelled.
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
          <td><strong>Status</strong></td>
          <td style="color:red;"><strong>Cancelled</strong></td>
        </tr>
      </table>

      <br />

      <p>
        Please check Deutsche Bahn for alternative services or updated travel information.
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
  async sendDepartureReminder(payload: NotificationPayload): Promise<void> {
    console.log("=================================");
    console.log("⏰ Departure Reminder");
    console.log(`User     : ${payload.userId}`);
    console.log(`Email    : ${payload.email}`);
    console.log(`Train    : ${payload.trainNumber}`);
    console.log(`Station  : ${payload.stationName}`);
    console.log(`Departure: ${payload.departureTime}`);
    console.log(`Reminder : ${payload.reminderMinutes} minute(s)`);
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
        Departure Reminder
      </p>

      <hr />

      <h2>${payload.title}</h2>

      <p>
        Hello <strong>${payload.firstName}</strong>,
      </p>

      <p>
        Your train is scheduled to depart in approximately
        <strong>${payload.reminderMinutes} minutes</strong>.
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
          <td><strong>Departure</strong></td>
          <td>${payload.departureTime}</td>
        </tr>
      </table>

      <br />

      <p>
        Please make sure you are at the station in time for your train.
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

  async sendArrivalReminder(payload: NotificationPayload): Promise<void> {
    console.log("=================================");
    console.log("⏰ Arrival Reminder");
    console.log(`User     : ${payload.userId}`);
    console.log(`Email    : ${payload.email}`);
    console.log(`Train    : ${payload.trainNumber}`);
    console.log(`Station  : ${payload.stationName}`);
    console.log(`Arrival  : ${payload.arrivalTime}`);
    console.log(`Reminder : ${payload.reminderMinutes} minute(s)`);
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
        Arrival Reminder
      </p>

      <hr />

      <h2>${payload.title}</h2>

      <p>
        Hello <strong>${payload.firstName}</strong>,
      </p>

      <p>
        Your train is scheduled to arrive in approximately
        <strong>${payload.reminderMinutes} minutes</strong>.
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
          <td><strong>Arrival</strong></td>
          <td>${payload.arrivalTime}</td>
        </tr>
      </table>

      <br />

      <p>
        Please prepare for your arrival.
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
