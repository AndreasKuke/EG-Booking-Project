import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { to, subject, body } = await request.json();

  const { data, error } = await resend.emails.send({
    from: 'Engestofte Julemarked <onboarding@resend.dev>',
    to,
    subject,
    text: body,
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }

  return Response.json({ success: true, id: data.id });
}
