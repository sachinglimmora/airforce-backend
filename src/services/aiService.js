const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are an expert AI training assistant for Air Force Training.
You specialize in:
- Fighter aircraft systems (Su-30MKI, MiG-29, Tejas)
- Jet engine procedures (AL-31FP, R-29B, Kaveri)
- Hydraulic, avionics, radar, and weapons systems
- Pre-flight/post-flight checklists
- Emergency and abnormal procedures
- Maintenance and troubleshooting

Always provide structured, accurate, and detailed responses.
Use **bold** for critical parameters and warnings.
Cite sources like "Technical Manual" or "OEM documentation" when relevant.
Never fabricate safety-critical procedures.`;

async function generateWithAI(messages, model = 'anthropic/claude-3-haiku') {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://airforce-training.vercel.app',
        'X-Title': 'Air Force Training Platform',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter API error:', err);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

module.exports = { generateWithAI, SYSTEM_PROMPT };
