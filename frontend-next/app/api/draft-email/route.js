import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const TABLE_PRICE = 155;
const CHAIR_PRICE = 45;

function formatCurrency(amount) {
  return `${amount.toLocaleString('da-DK')} kr.`;
}

function formatFurnitureLine(tableCount, chairCount) {
  const tables = Number(tableCount) || 0;
  const chairs = Number(chairCount) || 0;
  const parts = [];

  if (tables > 0) {
    parts.push(`${tables} ${tables === 1 ? 'bord' : 'borde'} a ${formatCurrency(TABLE_PRICE)} = ${formatCurrency(tables * TABLE_PRICE)}`);
  }
  if (chairs > 0) {
    parts.push(`${chairs} ${chairs === 1 ? 'stol' : 'stole'} a ${formatCurrency(CHAIR_PRICE)} = ${formatCurrency(chairs * CHAIR_PRICE)}`);
  }

  return parts.length > 0 ? parts.join(' og ') : '';
}

function getFurnitureTotal(tableCount, chairCount) {
  const tables = Number(tableCount) || 0;
  const chairs = Number(chairCount) || 0;

  return tables * TABLE_PRICE + chairs * CHAIR_PRICE;
}

function fallbackDraft({ vendorName, companyName, standId, standLocation, standType, price, choiceRank, tableCount, chairCount }) {
  const greetingName = vendorName || companyName || 'udstiller';
  const rankText = choiceRank === 1 ? 'jeres 1. valg' : `jeres ${choiceRank || 1}. valg`;
  const furnitureLine = formatFurnitureLine(tableCount, chairCount);
  const furnitureTotal = getFurnitureTotal(tableCount, chairCount);

  return {
    subject: `Din standplads til Engestofte Julemarked - Stand ${standId}`,
    draft: `Kære ${greetingName},

Vi kan med glæde bekræfte, at I har fået tildelt stand ${standId} til Engestofte Julemarked.

Placering: ${standLocation}
Standtype: ${standType}
Standpris: ${price}${furnitureLine ? `\nTilvalg: ${furnitureLine}` : ''}
${furnitureTotal > 0 ? `Tilvalg i alt: ${formatCurrency(furnitureTotal)}` : ''}

Standen er tildelt ud fra ${rankText}. I modtager yderligere information om betaling og opstillingsdato snarest.

Venlig hilsen,
Engestofte Julemarked`,
  };
}

function parseDraftResponse(text) {
  try {
    const parsed = JSON.parse(text);
    return {
      subject: parsed.subject?.trim() || '',
      draft: parsed.body?.trim() || parsed.draft?.trim() || '',
    };
  } catch {
    return { subject: '', draft: text?.trim() || '' };
  }
}

export async function POST(request) {
  const { vendorName, companyName, description, standId, standLocation, standType, price, choiceRank, tableCount, chairCount } = await request.json();

  if (!standId || !standLocation || !standType || !price) {
    return Response.json({ error: 'Missing stand details' }, { status: 400 });
  }

  const rankText = choiceRank === 1 ? '1. valg' : choiceRank === 2 ? '2. valg' : '3. valg';
  const choiceNote = choiceRank === 1
    ? 'Dette var deres 1. valg.'
    : `De fik tildelt stand ${standId}, men dette var deres ${rankText} — de fik ikke deres 1. valg.`;

  const furnitureLine = formatFurnitureLine(tableCount, chairCount);
  const furnitureTotal = getFurnitureTotal(tableCount, chairCount);
  const fallback = fallbackDraft({ vendorName, companyName, standId, standLocation, standType, price, choiceRank, tableCount, chairCount });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Skriv et professionelt og venligt e-mailudkast på dansk til en udstiller, der har fået tildelt en standplads til Engestofte Julemarked.

Oplysninger om udstilleren:
- Navn: ${vendorName}
- Virksomhed: ${companyName}
- Hvad de sælger: ${description || 'ikke oplyst'}
- Stand nr.: ${standId}
- Placering: ${standLocation}
- Type: ${standType}
- Standpris: ${price}
${furnitureLine ? `- Tilvalg: ${furnitureLine}\n- Tilvalg i alt: ${formatCurrency(furnitureTotal)}` : '- Tilvalg: ingen borde eller stole angivet'}
- ${choiceNote}

Skriv e-mailen fra Engestofte Julemarked arrangørerne. Vær varm og professionel. Emailen skal starte med "Kære ${vendorName || companyName || 'udstiller'},". Hvis de ikke fik deres 1. valg, anerkend det kort og venligt. Nævn standpris og eventuelle borde/stole med stk.-pris og samlet tilvalgspris i opsummeringen. Nævn at de vil modtage yderligere information om betaling og opstillingsdato. Afslut præcist med "Venlig hilsen," efterfulgt af "Engestofte Julemarked" på næste linje.

Returner kun gyldig JSON i dette format:
{"subject":"kort emnefelt","body":"selve e-mailteksten"}`,
        },
      ],
    });

    const text = message.content.find(block => block.type === 'text')?.text || '';
    const generated = parseDraftResponse(text);
    const subject = generated.subject || fallback.subject;
    const draft = generated.draft || fallback.draft;

    return Response.json({ draft, subject });
  } catch (error) {
    console.error('Failed to generate draft email', error);
    return Response.json(fallback);
  }
}
