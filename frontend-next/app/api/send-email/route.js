import { Resend } from 'resend';

export async function POST(request) {
  const { to, subject, body } = await request.json();
  const trimmedSubject = subject?.trim();
  const trimmedBody = body?.trim();

  if (!to || !trimmedSubject || !trimmedBody) {
    return Response.json({ error: 'Missing email recipient, subject or body' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'Engestofte Julemarked <onboarding@resend.dev>',
    to,
    subject: trimmedSubject,
    text: trimmedBody,
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ success: true, id: data.id });
}
