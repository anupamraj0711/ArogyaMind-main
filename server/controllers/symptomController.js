import axios from 'axios';
import SymptomRecord from '../models/SymptomRecord.js';
import Specialist from '../models/Specialist.js';

export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, patientId } = req.body;
    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    const prompt = `You are an expert AI medical triage assistant. Analyze the following patient symptoms: "${symptoms}"\n\nRespond STRICTLY in JSON (no markdown):\n{\n  "severity": "Low|Medium|High|Critical",\n  "conditions": [{"name":"...","probability":number}],\n  "recommendedSpecialistType": "...",\n  "immediateAction": "...",\n  "dietAndLifestyle": "..."\n}`;

    const resp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const responseText = resp?.data?.choices?.[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI response did not contain JSON, returning raw text');
      return res.status(502).json({ message: 'AI did not return valid JSON', raw: responseText });
    }

    const aiAnalysis = JSON.parse(jsonMatch[0]);
    aiAnalysis.rawResponse = responseText;

    const recordData = {
      symptoms,
      aiAnalysis
    };
    if (patientId) recordData.patient = patientId;

    const record = await SymptomRecord.create(recordData);

    const specialists = await Specialist.find({
      specialty: new RegExp(aiAnalysis.recommendedSpecialistType || '', 'i')
    }).populate('user', 'name email');

    res.json({ record, recommendedSpecialists: specialists });

  } catch (error) {
    console.error('OpenRouter/analyzeSymptoms error:', error?.response?.data || error.message || error);
    if (error.response?.status === 404) return res.status(404).json({ message: 'Model not available' });
    if (error.response?.status === 429) return res.status(429).json({ message: 'Rate limited by AI provider' });
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
