export type SymptomCode =
  | 'sore_throat'
  | 'fever'
  | 'cough'
  | 'runny_nose'
  | 'headache'
  | 'weakness'
  | 'abdominal_pain'
  | 'allergy';

export type SymptomOption = {
  code: SymptomCode;
  label: string; // UI label (current app uses RU strings)
  keywords: string[]; // tokens sent to backend for matching
};

export const SYMPTOM_OPTIONS: SymptomOption[] = [
  {
    code: 'sore_throat',
    label: 'Болит горло',
    keywords: ['sore throat', 'throat pain', 'болит горло', 'горло', 'ангина', 'tonsill'],
  },
  {
    code: 'fever',
    label: 'Температура',
    keywords: ['fever', 'temperature', 'high temperature', 'температура', 'жар', 'қызу'],
  },
  {
    code: 'cough',
    label: 'Кашель',
    keywords: ['cough', 'кашель', 'жөтел'],
  },
  {
    code: 'runny_nose',
    label: 'Насморк',
    keywords: ['runny nose', 'rhinitis', 'насморк', 'ринит', 'мұрын бітелу', 'түшкіру', 'чихание'],
  },
  {
    code: 'headache',
    label: 'Головная боль',
    keywords: ['headache', 'головная боль', 'мигрень', 'бас ауру'],
  },
  {
    code: 'weakness',
    label: 'Слабость',
    keywords: ['weakness', 'fatigue', 'слабость', 'әлсіздік', 'шаршау'],
  },
  {
    code: 'abdominal_pain',
    label: 'Боль в животе',
    keywords: ['abdominal pain', 'stomach ache', 'боль в животе', 'живот', 'іш ауру', 'іш'],
  },
  {
    code: 'allergy',
    label: 'Аллергия',
    keywords: [
      'allergy',
      'allergic',
      'аллергия',
      'аллергиялық',
      'urticaria',
      'hives',
      'rash',
      'skin rash',
      'сыпь',
      'бөртпе',
      'itch',
      'itching',
      'зуд',
      'қышу',
      'sneezing',
      'чихание',
      'түшкіру',
      'watery eyes',
      'слезотечение',
      'көзден жас ағу',
      'swelling',
      'отек',
      'ісіну',
    ],
  },
];

export function buildAnalyzeKeywords(
  selectedCodes: SymptomCode[],
  additionalText: string
): string[] {
  const fromOptions = selectedCodes
    .map((code) => SYMPTOM_OPTIONS.find((o) => o.code === code))
    .flatMap((opt) => opt?.keywords ?? []);

  const fromText = (additionalText || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);

  // de-dup, preserve order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...selectedCodes, ...fromOptions, ...fromText]) {
    const k = String(raw).trim();
    if (!k) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
  }
  return out;
}

