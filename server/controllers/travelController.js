import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

let ai;

export const getHotelRecommendations = async (req, res) => {
  const { hospital, city } = req.body;
  
  if (!hospital || !city) {
    return res.status(400).json({ message: 'Hospital and city are required' });
  }

  const prompt = `
    You are an expert travel assistant. Provide realistic or real hotel accommodations near: ${hospital} in ${city}.
    
    Respond STRICTLY in the following JSON format without markdown code blocks:
    {
      "hotels": [
        {
          "name": "Hotel Name",
          "distance": "1.2 km away",
          "rating": 4,
          "price": 2500,
          "description": "A comfortable stay located very close to the hospital.",
          "amenities": ["Free WiFi", "Hospital Shuttle"],
          "isAIPick": true
        }
      ]
    }
    Provide exactly 4 realistic hotel recommendations. Ensure exactly one of them is marked as isAIPick: true. Prices should be realistic in INR (e.g. between 1000 and 10000). Rating should be an integer between 2 and 5. Amenities should be selected from: "Free WiFi", "Parking", "Restaurant", "Hospital Shuttle".
  `;

  const getMockRecommendations = () => ({
    hotels: [
      {
        name: "Grand Comfort Inn",
        distance: "0.5 km away",
        rating: 4,
        price: 2500,
        description: "A comfortable and highly-rated stay located very close to the hospital.",
        amenities: ["Free WiFi", "Parking"],
        isAIPick: true
      },
      {
        name: "City Suites Extended Stay",
        distance: "1.2 km away",
        rating: 3,
        price: 1800,
        description: "Affordable extended stay options for long treatments.",
        amenities: ["Free WiFi", "Hospital Shuttle"],
        isAIPick: false
      },
      {
        name: "Medisplendid Residency",
        distance: "0.8 km away",
        rating: 5,
        price: 4500,
        description: "Premium rooms with round-the-clock room service and nursing support.",
        amenities: ["Free WiFi", "Parking", "Restaurant"],
        isAIPick: false
      },
      {
        name: "Care Guest House",
        distance: "1.5 km away",
        rating: 4,
        price: 1200,
        description: "Budget-friendly stay with simple amenities ideal for patient relatives.",
        amenities: ["Free WiFi", "Parking"],
        isAIPick: false
      }
    ]
  });

  try {
    let recommendations;
    let success = false;

    // 1. Try Gemini if API key is provided
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        if (!ai) {
          ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        
        const responseText = response.text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleanJson = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
          recommendations = JSON.parse(cleanJson);
          success = true;
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, will try fallback:', geminiErr.message);
      }
    }

    // 2. Try OpenRouter fallback if Gemini was skipped or failed
    if (!success && process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '') {
      try {
        console.log('Trying OpenRouter fallback for hotel recommendations...');
        const resp = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
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
        const responseText = resp?.data?.choices?.[0]?.message?.content || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const cleanJson = jsonMatch[0].replace(/,\s*([\]}])/g, '$1');
          recommendations = JSON.parse(cleanJson);
          success = true;
          console.log('OpenRouter fallback successful!');
        }
      } catch (openRouterErr) {
        console.warn('OpenRouter fallback failed:', openRouterErr.message);
      }
    }

    // 3. Fall back to mock if all AI calls failed
    if (!success) {
      console.log('Using mock recommendations fallback.');
      recommendations = getMockRecommendations();
    }

    res.json(recommendations);

  } catch (error) {
    console.error('Travel API error, falling back to mock hotels:', error);
    res.json(getMockRecommendations());
  }
};
