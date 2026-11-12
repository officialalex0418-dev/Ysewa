export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "YatraSewa <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[Resend Email Mock to ${to}]: Subject="${subject}"`);
    return { id: `mock-${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`[Resend API Error]:`, data);
      throw new Error(data.message || "Failed to send email via Resend API");
    }

    console.log(`[Resend Email Sent to ${to}]:`, data);
    return data;
  } catch (err) {
    console.error(`[Resend Dispatch Error to ${to}]:`, err);
    throw err;
  }
}
