import axios from 'axios';
import SymptomRecord from '../models/SymptomRecord.js';
import Specialist from '../models/Specialist.js';
import { GoogleGenAI } from '@google/genai';

let ai;

export const analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, patientId } = req.body;
    if (!symptoms) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    const prompt = `You are an expert AI medical triage assistant. Analyze the following patient symptoms: "${symptoms}"\n\nRespond STRICTLY in JSON (no markdown):\n{\n  "severity": "Low|Medium|High|Critical",\n  "conditions": [{"name":"...","probability":number}],\n  "recommendedSpecialistType": "...",\n  "immediateAction": "...",\n  "dietAndLifestyle": "..."\n}`;

    let aiAnalysis;
    let success = false;
    let responseText = "";

    // 1. Try Gemini if API key is provided
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        console.log('Trying Gemini for symptom analysis...');
        if (!ai) {
          ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        if (response && response.text) {
          responseText = response.text;
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const cleanJson = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
            aiAnalysis = JSON.parse(cleanJson);
            aiAnalysis.rawResponse = responseText;
            success = true;
            console.log('Gemini symptom analysis successful!');
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini symptom analysis failed, trying OpenRouter:', geminiErr.message);
      }
    }

    // 2. Try OpenRouter fallback
    if (!success && process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '') {
      try {
        console.log('Trying OpenRouter for symptom analysis...');
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
            timeout: 15000
          }
        );

        responseText = resp?.data?.choices?.[0]?.message?.content || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleanJson = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
          aiAnalysis = JSON.parse(cleanJson);
          aiAnalysis.rawResponse = responseText;
          success = true;
          console.log('OpenRouter symptom analysis successful!');
        }
      } catch (openRouterErr) {
        console.warn('OpenRouter symptom analysis failed:', openRouterErr.message);
      }
    }

    // 3. Fall back to smart mock if AI calls fail or are skipped
    if (!success) {
      console.log('Using smart mock fallback for symptom analysis...');
      const symLower = symptoms.toLowerCase();
      let severity = "Medium";
      let conditions = [{ name: "General Malaise", probability: 60 }];
      let recommendedSpecialistType = "Primary Care Physician";
      let immediateAction = "Monitor symptoms closely and consult a primary care physician if they persist or worsen.";
      let dietAndLifestyle = "Ensure adequate rest, hydration, and a balanced diet. Avoid trigger foods or stressors.";

      if (symLower.includes('chest') || symLower.includes('heart') || symLower.includes('breath') || symLower.includes('cardiac')) {
        severity = "Critical";
        conditions = [
          { name: "Angina Pectoris", probability: 70 },
          { name: "Myocardial Infarction", probability: 40 },
          { name: "Acid Reflux / GERD", probability: 80 }
        ];
        recommendedSpecialistType = "Cardiologist";
        immediateAction = "Sit down, remain calm, and seek emergency medical evaluation immediately. Do not exert yourself.";
        dietAndLifestyle = "Adopt a low-sodium, heart-healthy diet. Limit caffeine and stress. Avoid strenuous activity until cleared by a doctor.";
      } else if (symLower.includes('stomach') || symLower.includes('gastric') || symLower.includes('pain') && (symLower.includes('abdomen') || symLower.includes('belly') || symLower.includes('gastritis'))) {
        severity = "Medium";
        conditions = [
          { name: "Gastritis", probability: 85 },
          { name: "Gastroenteritis", probability: 60 },
          { name: "Irritable Bowel Syndrome (IBS)", probability: 50 }
        ];
        recommendedSpecialistType = "Gastroenterologist";
        immediateAction = "Avoid heavy, spicy, or acidic meals. Drink clear fluids and take antacids if approved by a doctor.";
        dietAndLifestyle = "Eat smaller, more frequent meals. Avoid smoking, alcohol, and caffeine. Maintain a food diary to identify triggers.";
      } else if (symLower.includes('head') || symLower.includes('migraine') || symLower.includes('brain')) {
        severity = "Medium";
        conditions = [
          { name: "Tension Headache", probability: 80 },
          { name: "Migraine", probability: 70 },
          { name: "Dehydration", probability: 55 }
        ];
        recommendedSpecialistType = "Neurologist";
        immediateAction = "Rest in a quiet, dark room. Apply a cool compress to your forehead and stay well-hydrated.";
        dietAndLifestyle = "Establish a regular sleep schedule, stay hydrated, and limit screen time. Avoid known migraine triggers like aged cheeses or chocolate.";
      } else if (symLower.includes('cough') || symLower.includes('fever') || symLower.includes('cold') || symLower.includes('throat')) {
        severity = "Low";
        conditions = [
          { name: "Viral Upper Respiratory Infection", probability: 90 },
          { name: "Acute Bronchitis", probability: 60 },
          { name: "Seasonal Allergies", probability: 50 }
        ];
        recommendedSpecialistType = "Pulmonologist";
        immediateAction = "Rest, drink plenty of warm fluids, and use a humidifier. Monitor your temperature.";
        dietAndLifestyle = "Get ample sleep, use saline nasal sprays, and drink warm tea with honey to soothe your throat.";
      }

      aiAnalysis = {
        severity,
        conditions,
        recommendedSpecialistType,
        immediateAction,
        dietAndLifestyle,
        rawResponse: "Fallback Mock Response"
      };
    }

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
    console.error('analyzeSymptoms general error:', error.message || error);
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
