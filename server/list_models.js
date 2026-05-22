import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function list() {
  try {
    const models = await ai.models.list();
    for (const model of models) {
      if (model.name.includes('gemini')) {
        console.log(model.name, '---', model.supportedGenerationMethods);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

list();
