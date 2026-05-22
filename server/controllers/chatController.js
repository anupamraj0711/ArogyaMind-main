import axios from 'axios';

export const handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation messages array (like the working code pattern)
    const systemMessage = {
      role: 'system',
      content: `You are an intelligent, empathetic medical assistant AI called "ArogyaMind Assistant" integrated into the ArogyaMind Healthcare Platform.

Your job is to:
- Help patients understand their symptoms and when to seek care
- Answer health-related questions with accurate, helpful information
- Guide users to the right specialist or department
- Explain medical terms in simple language
- Assist with booking appointments, finding doctors, and platform navigation

Rules:
- Always be warm, professional, and empathetic
- For emergencies (chest pain, difficulty breathing, stroke symptoms), always say: "Call emergency services (108) immediately"
- Do NOT diagnose definitively — always recommend consulting a doctor
- Keep responses concise and friendly (2-4 sentences usually)
- If asked non-health questions, gently redirect to health topics`
    };

    // Convert history to OpenAI message format
    const conversationMessages = [systemMessage];
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach(msg => { // keep last 10 messages for context
        conversationMessages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // Add the current user message
    conversationMessages.push({
      role: 'user',
      content: message
    });

    let replyText = '';
    let success = false;

    // ── Call OpenRouter (same proven pattern) ──
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim()) {
      try {
        console.log('🤖 Calling OpenRouter for chat...');

        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-3.5-turbo',
            messages: conversationMessages
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );

        replyText = response.data.choices[0].message.content;
        success = true;
        console.log('✅ Chat response successful!');

      } catch (apiErr) {
        console.error('❌ OpenRouter chat error:', apiErr.response?.data || apiErr.message);
      }
    }

    // ── Fallback if AI fails ──
    if (!success) {
      const lower = message.toLowerCase();
      if (lower.includes('chest') || lower.includes('heart attack') || lower.includes('can\'t breathe')) {
        replyText = '🚨 This sounds like a medical emergency! Please call 108 (emergency services) immediately or go to the nearest emergency room. Do not wait.';
      } else if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule')) {
        replyText = 'You can book an appointment by going to the "Appointments" section in the sidebar. You can browse specialists and choose a convenient time slot.';
      } else if (lower.includes('doctor') || lower.includes('specialist') || lower.includes('specialist')) {
        replyText = 'You can find specialists by visiting the "AI Recommendations" section. After submitting your symptoms, the system will recommend the most suitable specialists for you.';
      } else if (lower.includes('symptom') || lower.includes('feeling') || lower.includes('pain')) {
        replyText = 'Please use the "Submit Symptoms" section to get an AI-powered analysis of your symptoms. It will assess severity and recommend the right specialist for you.';
      } else {
        replyText = 'I\'m here to help with your health questions! You can use our platform to check symptoms, find specialists, book appointments, or get travel assistance to hospitals. How can I assist you today?';
      }
    }

    res.json({ reply: replyText });

  } catch (error) {
    console.error('💥 Chat controller error:', error.message || error);
    res.json({
      reply: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment, or use the navigation menu to find doctors, check your symptoms, or manage appointments.'
    });
  }
};
