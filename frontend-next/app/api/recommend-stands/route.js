import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';

const CATEGORY_KEYWORDS = [
  { category: 'vin', tags: ['vin', 'indendørs drikkevarer'], words: ['vin', 'vingård', 'vingaard', 'portvin', 'bobler'] },
  { category: 'varme drikke', tags: ['varme drikke', 'udendørs egnet'], words: ['gløgg', 'varm kakao', 'kaffe', 'te', 'varme drikke'] },
  { category: 'kolde drikke', tags: ['kolde drikke', 'drikkevarer'], words: ['sodavand', 'soda', 'lemonade', 'juice', 'saft', 'most', 'vand', 'iste', 'kolde drikke'] },
  { category: 'slik', tags: ['slik', 'søde sager'], words: ['slik', 'bolcher', 'karamel', 'karameller', 'lakrids', 'vingummi', 'konfekt'] },
  { category: 'mad', tags: ['mad', 'fødevarer'], words: ['mad', 'food', 'spise', 'ost', 'pølse', 'bakery', 'bager', 'kage', 'chokolade', 'honning'] },
  { category: 'keramik', tags: ['keramik', 'kunsthåndværk'], words: ['keramik', 'pottery', 'stentøj', 'ler'] },
  { category: 'smykker', tags: ['smykker', 'design'], words: ['smykke', 'smykker', 'ørering', 'halskæde', 'armbånd'] },
  { category: 'tekstil', tags: ['tekstil', 'håndarbejde'], words: ['tekstil', 'uld', 'strik', 'tøj', 'stof', 'knit'] },
  { category: 'interiør', tags: ['interiør', 'bolig'], words: ['interiør', 'bolig', 'lys', 'candle', 'dekoration', 'plakat', 'julepynt'] },
  { category: 'delikatesser', tags: ['delikatesser', 'fødevarer'], words: ['delikatesse', 'delikatesser', 'marmelade', 'specialiteter', 'snaps'] },
];

function getBuildingForStand(id) {
  if (id >= 98) return 'Udendørs område';
  if (id <= 11) return 'Hestestalden';
  if (id <= 57) return 'Kostalden';
  if (id <= 63) return 'Jagtstuen';
  return 'Laden';
}

function getStandType(id) {
  if (id >= 98) return 'Udendørsstand';
  return 'Indendørsstand';
}

function inferCategory(text) {
  const normalized = text.toLowerCase();
  const match = CATEGORY_KEYWORDS.find(item => item.words.some(word => normalized.includes(word)));
  return match || { category: 'blandet', tags: ['blandet sortiment'], words: [] };
}

function parseJsonResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      throw new Error('No JSON object found in model response');
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  }
}

async function classifyApplication(formData) {
  const fallback = inferCategory(`${formData.description || ''} ${formData.newVendorProducts || ''} ${formData.company || ''}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    return { ...fallback, source: 'rules' };
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Klassificér denne udstiller til et julemarked.

Virksomhed: ${formData.company || 'ikke oplyst'}
Beskrivelse: ${formData.description || 'ikke oplyst'}
Produkter: ${formData.newVendorProducts || 'ikke oplyst'}

Returner kun gyldig JSON:
{"category":"mad|vin|varme drikke|kolde drikke|slik|keramik|smykker|tekstil|interiør|delikatesser|blandet","tags":["kort tag","kort tag"]}`,
      }],
    });

    const text = message.content.find(block => block.type === 'text')?.text || '';
    const parsed = parseJsonResponse(text);
    return {
      category: parsed.category || fallback.category,
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags.slice(0, 4) : fallback.tags,
      source: 'ai',
    };
  } catch (error) {
    console.error('Failed to classify stand application', error);
    return { ...fallback, source: 'rules' };
  }
}

function getExistingCategoryCounts(bookings) {
  return bookings.reduce((counts, booking) => {
    const category = inferCategory(`${booking.company_name || ''} ${booking.email || ''}`).category;
    const building = getBuildingForStand(booking.stand_id);
    counts[building] = counts[building] || {};
    counts[building][category] = (counts[building][category] || 0) + 1;
    return counts;
  }, {});
}

function scoreStand(stand, category, categoryCounts) {
  const building = getBuildingForStand(stand.id);
  const sameCategoryInBuilding = categoryCounts[building]?.[category] || 0;
  let score = 100;

  score -= sameCategoryInBuilding * 18;
  if (category === 'vin') {
    if (building === 'Udendørs område') score -= 45;
    else score += 16;
    if (building === 'Jagtstuen') score += 4;
  }
  if (category === 'mad' || category === 'varme drikke') {
    if (building === 'Udendørs område') score += 14;
    if (building === 'Jagtstuen') score -= 10;
  }
  if (category === 'kolde drikke' || category === 'slik') {
    if (building === 'Udendørs område') score -= 8;
    if (building === 'Kostalden' || building === 'Laden') score += 8;
  }
  if (category === 'keramik' || category === 'smykker' || category === 'tekstil' || category === 'interiør') {
    if (building === 'Kostalden' || building === 'Laden') score += 8;
  }
  if (stand.status !== 'available') score -= 100;

  return score;
}

function getDiversityPenalty(candidate, selected) {
  return selected.reduce((penalty, recommendation) => {
    if (candidate.building !== recommendation.building) return penalty;

    const distance = Math.abs(candidate.standId - recommendation.standId);
    if (distance <= 1) return penalty + 60;
    if (distance <= 3) return penalty + 42;
    if (distance <= 6) return penalty + 24;

    return penalty + 12;
  }, 0);
}

function selectDiverseRecommendations(candidates, limit = 6) {
  const selected = [];
  const pool = [...candidates];

  while (selected.length < limit && pool.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = -Infinity;

    pool.forEach((candidate, index) => {
      const adjustedScore = candidate.score - getDiversityPenalty(candidate, selected);
      if (adjustedScore > bestAdjustedScore) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    });

    const [picked] = pool.splice(bestIndex, 1);
    selected.push({ ...picked, score: Math.round(bestAdjustedScore) });
  }

  return selected;
}

export async function POST(request) {
  const { formData, stands = [], bookings = [] } = await request.json();
  const classification = await classifyApplication(formData || {});
  const bookedIds = new Set(bookings.filter(b => b.status === 'confirmed').map(b => b.stand_id));
  const categoryCounts = getExistingCategoryCounts(bookings);

  const candidates = stands
    .filter(stand => !bookedIds.has(stand.id))
    .map(stand => {
      const building = getBuildingForStand(stand.id);
      const score = scoreStand(stand, classification.category, categoryCounts);
      return {
        standId: stand.id,
        score,
        building,
        standType: getStandType(stand.id),
        reason: `${building} har en god spredning i forhold til kategorien ${classification.category}.`,
      };
    })
    .sort((a, b) => b.score - a.score || a.standId - b.standId);
  const recommendations = selectDiverseRecommendations(candidates, 6);

  return Response.json({
    category: classification.category,
    tags: classification.tags,
    source: classification.source,
    recommendations,
  });
}
