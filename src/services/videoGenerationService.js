const { generateWithAI } = require('./aiService');
const { uploadVideoBuffer } = require('./cloudinaryService');

async function callVideoGenerationAPI(prompt) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
  };

  // minimax/video-01 — active text-to-video model on Replicate
  const initResp = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      input: {
        prompt,
        prompt_optimizer: true,
      },
    }),
  });

  const initBody = await initResp.json();
  console.log('[Replicate] init response:', initResp.status, JSON.stringify(initBody).slice(0, 300));

  if (!initResp.ok) {
    throw new Error(`Replicate init failed (${initResp.status}): ${JSON.stringify(initBody)}`);
  }

  const pollUrl = initBody.urls?.get;
  if (!pollUrl) throw new Error('Replicate did not return a poll URL');

  // 2. Poll every 5s, up to 5 min
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));

    const pollResp = await fetch(pollUrl, { headers });
    const status = await pollResp.json();
    console.log(`[Replicate] poll ${i + 1}: status=${status.status}`);

    if (status.status === 'succeeded') {
      const videoUrl = Array.isArray(status.output) ? status.output[0] : status.output;
      console.log('[Replicate] succeeded, downloading:', videoUrl);
      const videoResp = await fetch(videoUrl);
      if (!videoResp.ok) throw new Error(`Failed to download video: ${videoResp.status}`);
      return Buffer.from(await videoResp.arrayBuffer());
    }

    if (status.status === 'failed' || status.status === 'canceled') {
      throw new Error(`Replicate generation ${status.status}: ${status.error || 'unknown error'}`);
    }
  }

  throw new Error('Replicate generation timed out after 5 minutes');
}

async function buildVideoPrompt(title, description, documentation) {
  const messages = [
    {
      role: 'user',
      content: `Write a concise video generation prompt (under 100 words) for an Air Force training video about:
Title: ${title}
Description: ${description}
Key content: ${documentation?.slice(0, 300) || 'N/A'}

Military style, cinematic, professional instructional footage.
Output only the prompt text, nothing else.`,
    },
  ];
  return generateWithAI(messages, 'anthropic/claude-3-haiku');
}

async function generateAndUploadVideo({ moduleId, title, description, documentation }) {
  const prompt = await buildVideoPrompt(title, description, documentation);
  console.log('[VideoGen] Generated prompt:', prompt);
  const videoBuffer = await callVideoGenerationAPI(prompt);
  const publicId = `module-${moduleId}`;
  return uploadVideoBuffer(videoBuffer, publicId);
}

module.exports = { generateAndUploadVideo };
