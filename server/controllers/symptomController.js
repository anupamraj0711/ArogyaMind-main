import axios from 'axios';
import SymptomRecord from '../models/SymptomRecord.js';
import Specialist from '../models/Specialist.js';

// ─────────────────────────────────────────────────────
// Specialist keyword map → maps AI output to DB queries
// ─────────────────────────────────────────────────────
const SPECIALIST_MAP = {
  'cardiolog':        'Cardiologist',
  'heart':            'Cardiologist',
  'neurolog':         'Neurologist',
  'brain':            'Neurologist',
  'gastroenterolog':  'Gastroenterologist',
  'stomach':          'Gastroenterologist',
  'gastro':           'Gastroenterologist',
  'pulmonolog':       'Pulmonologist',
  'lung':             'Pulmonologist',
  'respirat':         'Pulmonologist',
  'dermatolog':       'Dermatologist',
  'skin':             'Dermatologist',
  'orthoped':         'Orthopedist',
  'bone':             'Orthopedist',
  'joint':            'Orthopedist',
  'psychiatr':        'Psychiatrist',
  'mental':           'Psychiatrist',
  'psycholog':        'Psychologist',
  'endocrinolog':     'Endocrinologist',
  'diabetes':         'Endocrinologist',
  'thyroid':          'Endocrinologist',
  'ophthalmolog':     'Ophthalmologist',
  'eye':              'Ophthalmologist',
  'ent':              'ENT Specialist',
  'ear':              'ENT Specialist',
  'nose':             'ENT Specialist',
  'throat':           'ENT Specialist',
  'gynecolog':        'Gynecologist',
  'obstet':           'Gynecologist',
  'urol':             'Urologist',
  'kidney':           'Nephrologist',
  'nephrol':          'Nephrologist',
  'oncolog':          'Oncologist',
  'cancer':           'Oncologist',
  'hematolog':        'Hematologist',
  'blood':            'Hematologist',
  'rheumatolog':      'Rheumatologist',
  'arthritis':        'Rheumatologist',
  'primary':          'General Practitioner',
  'general':          'General Practitioner',
  'family':           'General Practitioner',
};

// Normalize specialist type returned by AI to something we can search in DB
function normalizeSpecialist(aiType) {
  if (!aiType) return null;
  const lower = aiType.toLowerCase();
  for (const [keyword, mapped] of Object.entries(SPECIALIST_MAP)) {
    if (lower.includes(keyword)) return mapped;
  }
  return aiType; // return as-is if no match found
}

function extractJsonPayload(text) {
  if (!text) return null;

  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  const candidate = match[0].replace(/,\s*([\]}])/g, '$1');
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function normalizeAnalysis(parsed, rawResponse) {
  if (!parsed) return null;

  const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  const conditions = Array.isArray(parsed.conditions) && parsed.conditions.length
    ? parsed.conditions
    : (parsed.possible_condition ? [{ name: parsed.possible_condition, probability: 80 }] : []);

  return {
    severity: parsed.severity || parsed.risk_level || parsed.risk || 'Medium',
    conditions,
    recommendedSpecialistType: parsed.recommendedSpecialistType || parsed.specialist || 'General Practitioner',
    immediateAction:
      parsed.immediateAction ||
      parsed.summary ||
      recommendations[0] ||
      'Monitor your symptoms and consult a doctor if they worsen.',
    dietAndLifestyle:
      parsed.dietAndLifestyle ||
      recommendations.slice(1).join('. ') ||
      'Maintain a balanced diet, stay hydrated, and get adequate rest.',
    rawResponse,
    source: 'openrouter'
  };
}

function buildFallbackAnalysis(symptoms) {
  const sym = symptoms.toLowerCase();

  let severity = 'Medium';
  let conditions = [];
  let recommendedSpecialistType = 'General Practitioner';
  let immediateAction = 'Please consult a doctor for a proper diagnosis.';
  let dietAndLifestyle = 'Maintain a balanced diet, stay hydrated, and get adequate rest.';

  if (sym.includes('chest') || sym.includes('heart') || sym.includes('cardiac') || sym.includes('palpitat') || sym.includes('pressure in chest')) {
    severity = 'Critical';
    conditions = [
      { name: 'Cardiac Ischemia', probability: 78 },
      { name: 'Angina', probability: 72 },
      { name: 'Acid Reflux / GERD', probability: 42 }
    ];
    recommendedSpecialistType = 'Cardiologist';
    immediateAction = 'Sit down immediately, avoid exertion, and seek emergency medical care if the pain is severe, persistent, or spreading.';
    dietAndLifestyle = 'Follow a heart-healthy diet, avoid smoking, limit alcohol, and reduce caffeine until cleared by a doctor.';
  } else if (sym.includes('migraine') || sym.includes('headache') || sym.includes('dizzy') || sym.includes('vertigo') || sym.includes('head pain')) {
    severity = 'Medium';
    conditions = [
      { name: 'Migraine', probability: 82 },
      { name: 'Tension Headache', probability: 68 },
      { name: 'Dehydration', probability: 46 }
    ];
    recommendedSpecialistType = 'Neurologist';
    immediateAction = 'Rest in a quiet dark room, drink water, and avoid screen strain until symptoms settle.';
    dietAndLifestyle = 'Keep a regular sleep schedule, stay hydrated, and avoid known migraine triggers such as skipped meals.';
  } else if (sym.includes('stomach') || sym.includes('abdom') || sym.includes('gastric') || sym.includes('nausea') || sym.includes('vomit') || sym.includes('diarrhea') || sym.includes('acid reflux') || sym.includes('gastritis')) {
    severity = 'Medium';
    conditions = [
      { name: 'Gastritis', probability: 80 },
      { name: 'Gastroenteritis', probability: 64 },
      { name: 'Food Intolerance', probability: 48 }
    ];
    recommendedSpecialistType = 'Gastroenterologist';
    immediateAction = 'Drink clear fluids, avoid heavy or spicy food, and seek care if pain becomes severe or you cannot keep fluids down.';
    dietAndLifestyle = 'Eat smaller bland meals, avoid alcohol and caffeine, and monitor which foods worsen your symptoms.';
  } else if (sym.includes('cough') || sym.includes('wheez') || sym.includes('breath') || sym.includes('asthma') || sym.includes('lung') || sym.includes('throat')) {
    severity = 'Medium';
    conditions = [
      { name: 'Upper Respiratory Infection', probability: 76 },
      { name: 'Bronchitis', probability: 64 },
      { name: 'Asthma Exacerbation', probability: 52 }
    ];
    recommendedSpecialistType = 'Pulmonologist';
    immediateAction = 'Rest, use prescribed inhalers if available, and seek urgent care if breathing worsens or lips turn blue.';
    dietAndLifestyle = 'Avoid smoke and dust, drink warm fluids, and use a humidifier if the air is dry.';
  } else if (sym.includes('fever') || sym.includes('chills') || sym.includes('cold') || sym.includes('flu') || sym.includes('infection')) {
    severity = 'Low';
    conditions = [
      { name: 'Viral Infection', probability: 82 },
      { name: 'Influenza', probability: 64 },
      { name: 'Upper Respiratory Infection', probability: 54 }
    ];
    recommendedSpecialistType = 'General Practitioner';
    immediateAction = 'Rest, stay hydrated, and monitor for red flags like shortness of breath or persistent high fever.';
    dietAndLifestyle = 'Drink plenty of fluids and eat light nutritious meals until you recover.';
  } else if (sym.includes('rash') || sym.includes('itch') || sym.includes('skin') || sym.includes('allerg')) {
    severity = 'Low';
    conditions = [
      { name: 'Contact Dermatitis', probability: 76 },
      { name: 'Allergic Reaction', probability: 68 },
      { name: 'Eczema', probability: 52 }
    ];
    recommendedSpecialistType = 'Dermatologist';
    immediateAction = 'Avoid the suspected trigger, apply a cool compress, and seek urgent care if swelling or breathing difficulty appears.';
    dietAndLifestyle = 'Use fragrance-free products, keep skin moisturized, and avoid known allergens.';
  } else if (sym.includes('joint') || sym.includes('knee') || sym.includes('back') || sym.includes('bone') || sym.includes('arthrit') || sym.includes('muscle')) {
    severity = 'Medium';
    conditions = [
      { name: 'Muscle Strain', probability: 72 },
      { name: 'Arthritis', probability: 66 },
      { name: 'Soft Tissue Injury', probability: 50 }
    ];
    recommendedSpecialistType = 'Orthopedist';
    immediateAction = 'Rest the area, use ice for swelling, and avoid movements that make the pain worse.';
    dietAndLifestyle = 'Maintain a healthy weight, stretch gently, and keep calcium and vitamin D intake adequate.';
  } else if (sym.includes('sad') || sym.includes('depress') || sym.includes('anxiet') || sym.includes('stress') || sym.includes('mental') || sym.includes('panic') || sym.includes('sleep')) {
    severity = 'Medium';
    conditions = [
      { name: 'Anxiety Disorder', probability: 72 },
      { name: 'Depressive Symptoms', probability: 66 },
      { name: 'Stress-Related Condition', probability: 56 }
    ];
    recommendedSpecialistType = 'Psychiatrist';
    immediateAction = 'Reach out to someone you trust, and seek urgent help if you have thoughts of self-harm.';
    dietAndLifestyle = 'Keep a regular sleep routine, exercise daily, and reduce alcohol or stimulant use.';
  }

  if (!conditions.length) {
    conditions = [
      { name: 'Undifferentiated Symptoms', probability: 60 },
      { name: 'Viral Illness', probability: 50 },
      { name: 'Nutritional Deficiency', probability: 35 }
    ];
  }

  return {
    severity,
    conditions,
    recommendedSpecialistType,
    immediateAction,
    dietAndLifestyle,
    rawResponse: 'Fallback rule-based analysis',
    source: 'fallback'
  };
}

// Find specialists from DB using flexible regex matching
async function findSpecialists(specialistType) {
  if (!specialistType) return [];

  // First try exact/partial match on the specialist type
  let specialists = await Specialist.find({
    specialty: new RegExp(specialistType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  }).populate('user', 'name email').limit(5);

  // If no results, try individual keywords
  if (!specialists.length) {
    const words = specialistType.split(/\s+/).filter(w => w.length > 3);
    for (const word of words) {
      specialists = await Specialist.find({
        specialty: new RegExp(word, 'i')
      }).populate('user', 'name email').limit(5);
      if (specialists.length) break;
    }
  }

  // Last resort: return any specialists
  if (!specialists.length) {
    specialists = await Specialist.find({}).populate('user', 'name email').limit(3);
  }

  return specialists;
}

// ─────────────────────────────────────────────────────
// Main analyze function
// ─────────────────────────────────────────────────────
export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, patientId } = req.body;
    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    console.log('\n🔍 Analyzing symptoms:', symptoms);

    const prompt = `You are a clinical assistant AI.

Analyze the following patient symptoms: "${symptoms}"

Return ONLY valid JSON with NO markdown, NO code blocks, NO extra text:
{
  "severity": "Low|Medium|High|Critical",
  "conditions": [
    {"name": "Condition Name", "probability": 85},
    {"name": "Another Condition", "probability": 60}
  ],
  "recommendedSpecialistType": "Cardiologist",
  "immediateAction": "What the patient should do right now.",
  "dietAndLifestyle": "Diet and lifestyle advice for this condition."
}

Rules:
- severity must be exactly one of: Low, Medium, High, Critical
- conditions must have 2 to 4 items with probability between 1 and 100
- recommendedSpecialistType must be a real medical specialist type
- immediateAction must be specific and actionable
- dietAndLifestyle must be specific medical advice
- if the symptom is ambiguous, still return the most likely specialist and the best clinical next step instead of a vague label`;

    let aiAnalysis = null;

    // ── Try OpenRouter (using exact same pattern as user's working code) ──
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim()) {
      try {
        console.log('🤖 Calling OpenRouter API...');

        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );

        // Extract the AI text
        let aiText = response.data.choices[0].message.content;
        console.log('📝 Raw AI Response:', aiText.substring(0, 300));
        const parsed = extractJsonPayload(aiText);
        if (parsed) {
          aiAnalysis = normalizeAnalysis(parsed, aiText);
          console.log('✅ OpenRouter analysis successful!');
        } else {
          console.warn('⚠️ No JSON found in AI response:', aiText);
        }

      } catch (apiErr) {
        console.error('❌ OpenRouter API error:', apiErr.response?.data || apiErr.message);
      }
    } else {
      console.warn('⚠️ OPENROUTER_API_KEY is not set');
    }

    // ── Smart keyword-based fallback (only if AI failed) ──
    if (!aiAnalysis) {
      console.log('⚡ Using enhanced keyword fallback...');
      aiAnalysis = buildFallbackAnalysis(symptoms);
    }

    // ── Save to DB ──
    const recordData = { symptoms, aiAnalysis };
    if (patientId) recordData.patient = patientId;
    const record = await SymptomRecord.create(recordData);

    // ── Find recommended specialists with flexible matching ──
    const normalizedType = normalizeSpecialist(aiAnalysis.recommendedSpecialistType);
    console.log(`🔎 Searching for specialists: "${aiAnalysis.recommendedSpecialistType}" → "${normalizedType}"`);
    const specialists = await findSpecialists(normalizedType);
    console.log(`👨‍⚕️ Found ${specialists.length} specialist(s)`);

    res.json({ record, recommendedSpecialists: specialists });

  } catch (error) {
    console.error('💥 analyzeSymptoms error:', error.message || error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

export const getSymptomHistory = async (req, res) => {
  try {
    const history = await SymptomRecord.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
