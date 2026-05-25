import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request) {
  const { vendorName, companyName, vendorEmail, description, standId, standLocation, standType, price, choiceRank } = await request.json();

  const rankText = choiceRank === 1 ? '1. valg' : choiceRank === 2 ? '2. valg' : '3. valg';
  const choiceNote = choiceRank === 1
    ? 'Dette var deres 1. valg.'
    : `De fik tildelt stand ${standId}, men dette var deres ${rankText} — de fik ikke deres 1. valg.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Skriv en professionel og venlig e-mail på dansk til en udstiller, der har fået tildelt en standplads til Engestofte Julemarked.

Oplysninger om udstilleren:
- Navn: ${vendorName}
- Virksomhed: ${companyName}
- Hvad de sælger: ${description || 'ikke oplyst'}
- Stand nr.: ${standId}
- Placering: ${standLocation}
- Type: ${standType}
- Pris: DKK ${price}
- ${choiceNote}

Skriv e-mailen fra Engestofte Julemarked arrangørerne. Vær varm og professionel. Hvis de ikke fik deres 1. valg, anerkend det kort og venligt. Nævn at de vil modtage yderligere information om betaling og opstillingsdato. Afslut med venlig hilsen fra Engestofte Julemarked.

Returner kun selve e-mailteksten — ingen forklaring, ingen ekstra tekst.`,
      },
    ],
  });

  const draft = message.content[0].text;
  const subject = `Din standplads til Engestofte Julemarked – Stand ${standId}`;

  return Response.json({ draft, subject });
}
