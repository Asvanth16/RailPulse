import { emailService } from "../src/realtime/notifications/email.service";

async function main(): Promise<void> {
  const recipient = process.env.TEST_EMAIL;

  if (!recipient) {
    throw new Error("Missing TEST_EMAIL environment variable.");
  }

  await emailService.send({
    to: recipient,
    subject: "RailPulse Brevo Test",
    html: `
      <h1>🚆 RailPulse</h1>
      <p>Brevo email integration is working.</p>
    `,
  });

  console.log("✅ Test email request completed.");
}

main().catch((error) => {
  console.error("❌ Test email failed:", error);
  process.exitCode = 1;
});