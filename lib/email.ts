const MJ_URL = 'https://api.mailjet.com/v3.1/send';

export async function sendMagicCode(
  to: string,
  code: string,
  magicLink: string
): Promise<void> {
  const body = {
    Messages: [{
      From: {
        Email: process.env.MAILJET_FROM_EMAIL,
        Name: process.env.MAILJET_FROM_NAME,
      },
      To: [{ Email: to }],
      Subject: `${code} – Ihr Anmeldecode für den DRK Briefbogen-Generator`,
      HTMLPart: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #e30613; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 1.4rem;">
              DRK Briefbogen-Generator
            </h1>
          </div>
          <div style="padding: 32px; background: #fff;">
            <p>Ihr Anmeldecode lautet:</p>
            <div style="font-size: 2.5rem; font-weight: bold; letter-spacing: 0.5rem;
                        color: #e30613; text-align: center; padding: 16px 0;">
              ${code}
            </div>
            <p style="color: #6b7280; font-size: 0.875rem;">
              Der Code ist 15 Minuten gültig.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${magicLink}"
                 style="background: #e30613; color: white; padding: 12px 24px;
                        border-radius: 8px; text-decoration: none; font-weight: bold;">
                Oder direkt anmelden &rarr;
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 0.75rem;">
              Wenn Sie diese E-Mail nicht angefordert haben, können Sie sie ignorieren.
            </p>
          </div>
        </div>
      `,
      TextPart: `Ihr Anmeldecode: ${code}\n\nDirektlink: ${magicLink}\n\nGültig für 15 Minuten.`,
    }],
  };

  const auth = Buffer.from(
    `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`
  ).toString('base64');

  const res = await fetch(MJ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mailjet error: ${err}`);
  }
}
