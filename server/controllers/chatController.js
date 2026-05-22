import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

let ai;

export const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // System prompt to set the AI's identity
    const systemPrompt = `You are an intelligent, empathetic, and highly capable medical assistant AI integrated into the Agentic Healthcare Platform. 
Your goal is to help users (patients) navigate the platform, understand their medical options, and assist with general inquiries. 
You can answer questions about finding doctors, booking appointments, the symptom checking process, and travel assistance. 
Keep your answers concise, professional, and friendly. If a user describes a medical emergency, advise them to call emergency services immediately.`;

    // Construct the conversation history
    let conversation = systemPrompt + "\n\n";
    if (history && history.length > 0) {
      history.forEach(msg => {
        conversation += `${msg.sender === 'user' ? 'Patient' : 'Assistant'}: ${msg.text}\n`;
      });
    }
    conversation += `Patient: ${message}\nAssistant:`;

    let replyText = "";
    let success = false;

    // 1. Try Gemini if API key is provided
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        if (!ai) {
          ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: conversation,
        });
        if (response && response.text) {
          replyText = response.text;
          success = true;
        }
      } catch (geminiErr) {
        console.warn('Chat Gemini API call failed, trying fallback:', geminiErr.message);
      }
    }

    // 2. Try OpenRouter fallback
    if (!success && process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '') {
      try {
        console.log('Trying OpenRouter fallback for chat...');
        const resp = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
            messages: [{ role: 'user', content: conversation }]
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
        const content = resp?.data?.choices?.[0]?.message?.content;
        if (content) {
          replyText = content;
          success = true;
          console.log('OpenRouter chat fallback successful!');
        }
      } catch (openRouterErr) {
        console.warn('OpenRouter chat fallback failed:', openRouterErr.message);
      }
    }

    // 3. Fall back to friendly standard message if both AI calls failed
    if (!success) {
      console.log('Using friendly static assistant response.');
      replyText = `Hello! I'm your healthcare assistant. It looks like our AI service is currently experiencing high load, but I can help answer general questions. You can check your symptoms on the "Symptom Checker" tab, find doctors under the "Specialist Finder" tab, manage your "Appointments", or use "Travel & Routing" to plan your hospital visit. If you have an urgent medical query, please contact a doctor or call emergency services directly.`;
    }

    res.json({ reply: replyText });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.json({ 
      reply: `I'm sorry, I encountered an issue processing that. Please try again in a moment, or use our manual navigation tabs to find doctors, check symptom history, or view your appointments.`
    });
  }
};
