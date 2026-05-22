import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const key = process.env.OPENROUTER_API_KEY;
console.log('API Key:', key ? 'Loaded' : 'Not Loaded');

async function test() {
  try {
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }]
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Success!', res.data.choices[0].message);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

test();
