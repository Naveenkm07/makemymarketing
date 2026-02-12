import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        if (!resend) {
            console.warn("RESEND_API_KEY missing. Email skipped:", subject);
            return { success: false, error: "Missing API Key" };
        }

        const { data, error } = await resend.emails.send({
            from: 'Make My Marketing <onboarding@resend.dev>', // Default testing domain
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email send error:", error);
        return { success: false, error };
    }
}

export const EmailTemplates = {
    bookingConfirmation: (bookingId: string, amount: number, screenName: string) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Booking Confirmed! 🎉</h2>
      <p>Your campaign has been successfully booked on <strong>${screenName}</strong>.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${amount}</p>
      </div>
      <p>Upload your creative if you haven't already!</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/advertiser" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
    </div>
  `,

    screenApproved: (screenName: string) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #16a34a;">Screen Approved! ✅</h2>
      <p>Great news! Your screen <strong>${screenName}</strong> has been verified by our admin team.</p>
      <p>It is now visible to advertisers on the marketplace.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/owner" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Screen</a>
    </div>
  `,

    payoutProcessed: (amount: number, ref: string) => `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #ca8a04;">Payout On The Way 💸</h2>
      <p>We've processed a payout of <strong>₹${amount.toLocaleString()}</strong> to your bank account.</p>
      <p>Reference ID: <code>${ref}</code></p>
      <p>Expect the funds within 2-3 business days.</p>
    </div>
  `,
};
