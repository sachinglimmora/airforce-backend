const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { chatHistory } = require('../data/db');
const { authenticate } = require('../middleware/auth');

/**
 * Very lightweight rule-based AI assistant.
 * In production, replace generateResponse() with a real LLM call (Gemini, OpenAI, etc.)
 */
const knowledgeBase = [
  {
    keywords: ['engine start', 'start procedure', 'al-31fp start'],
    response: `**AL-31FP Engine Start Procedure:**\n\n1. **Pre-start Check** – Verify all engine parameters are within normal range\n2. **APU Start** – Start auxiliary power unit and verify bleed air pressure\n3. **Engine Crank** – Engage starter and monitor N2 rotation\n4. **Fuel Introduction** – Introduce fuel at 15% N2 and monitor EGT\n5. **Light-off** – Confirm engine light-off at rising EGT\n6. **Stabilisation** – Allow engine to stabilise at idle RPM\n\n*Reference: AL-31FP Engine Manual, Module 2*`,
    sources: ['AL-31FP Engine Manual', 'Training Module: Engine Start Procedures'],
  },
  {
    keywords: ['hydraulic', 'hydraulics', 'hydraulic system', 'hydraulic pressure'],
    response: `**Hydraulic System Overview:**\n\nThe Su-30MKI has three independent hydraulic systems operating at **3000 PSI**:\n- **System 1**: Engine-driven pump (primary)\n- **System 2**: Electric pump (secondary/emergency)\n- **System 3**: Backup for flight controls\n\n**Common faults:** Low pressure indication – check pump status, check for leaks at actuators and lines.\n\n*Reference: Hydraulic Systems Fundamentals Course*`,
    sources: ['Hydraulic Systems Fundamentals', 'Maintenance Manual Chapter 29'],
  },
  {
    keywords: ['pre-flight', 'pre flight', 'walk-around', 'preflight inspection'],
    response: `**Pre-flight Inspection Checklist:**\n\n1. Exterior walk-around – fuselage, wings, control surfaces\n2. Check fluid levels (oil, hydraulic, fuel)\n3. Verify tire condition and brake wear\n4. Inspect weapon pylons and stores\n5. Check pitot tubes and static ports\n6. Verify canopy seals and locking mechanisms\n7. Cockpit pre-start checks\n\n*Reference: Simulation: Pre-flight Inspection*`,
    sources: ['Pre-flight Inspection Simulation', 'Flight Manual Section 2'],
  },
  {
    keywords: ['emergency', 'fire', 'engine fire'],
    response: `**Engine Fire Emergency Procedure:**\n\n1. **Identify** – Check engine fire warning light\n2. **Throttle** – Reduce to idle\n3. **Fire Suppression** – Activate fire extinguisher\n4. **Engine Shutdown** – Complete shutdown if fire persists\n5. **Declare Emergency** – Notify ATC/GCI\n6. **Divert** – Proceed to nearest suitable airfield\n\n⚠️ *Always cross-check with the Emergency Procedures Checklist in the cockpit.*`,
    sources: ['Emergency Procedures Manual', 'Simulation: Engine Fire Emergency'],
  },
  {
    keywords: ['avionics', 'radar', 'n011m', 'bars radar'],
    response: `**N011M Bars Radar System:**\n\n- Type: Passive Electronically Scanned Array (PESA)\n- Detection range: up to **400 km** (air targets)\n- Simultaneous tracking: **20 targets**\n- Engagement: up to **4 targets** simultaneously\n- Modes: Air-to-Air, Air-to-Ground, Mapping, Terrain Following\n\n*Reference: Avionics Suite Overview Course*`,
    sources: ['Avionics Suite Overview', 'N011M Radar System Manual'],
  },
  {
    keywords: ['fuel', 'fuel system', 'refuel', 'fuel pump'],
    response: `**Fuel System Overview:**\n\n- Total internal fuel: **9.4 tonnes**\n- External capability: up to 3 × 1800L drop tanks\n- Flow rate: 10,000 kg/hr (Main Fuel Pump)\n- Feed system: Engine-driven and electric boost pumps\n\n**Fuel management:** Transfer sequence is automatic via FMC. Select cross-feed in emergency.\n\n*Reference: Fuel Systems Management Course*`,
    sources: ['Fuel Systems Management', 'Fuel System Maintenance Chapter 28'],
  },
];

function generateResponse(message) {
  const lower = message.toLowerCase();

  for (const entry of knowledgeBase) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return { content: entry.response, sources: entry.sources };
    }
  }

  return {
    content: `I understand you're asking about **"${message}"**. This topic is covered across several training modules in the IAF platform.\n\nFor detailed information, I recommend:\n- Browsing the **Training Catalog** for relevant courses\n- Checking the **Digital Twin** for live system status\n- Reviewing your **Progress Dashboard** for pending modules\n\nCould you be more specific? For example, you can ask about:\n- Engine start procedures\n- Hydraulic system faults\n- Pre-flight inspection steps\n- Emergency procedures`,
    sources: [],
  };
}

// GET /api/ai-assistant/history
router.get('/history', authenticate, (req, res) => {
  const history = chatHistory[req.user.id] || [];
  res.json(history);
});

// POST /api/ai-assistant/message
router.post('/message', authenticate, (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  if (!chatHistory[req.user.id]) {
    chatHistory[req.user.id] = [
      {
        id: uuidv4(),
        role: 'assistant',
        content: 'Welcome to the IAF Training Intelligence Platform. I am your AI training assistant. How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ];
  }

  // Save user message
  const userMsg = {
    id: uuidv4(),
    role: 'user',
    content: content.trim(),
    timestamp: new Date().toISOString(),
  };
  chatHistory[req.user.id].push(userMsg);

  // Generate and save assistant response
  const { content: responseContent, sources } = generateResponse(content);
  const assistantMsg = {
    id: uuidv4(),
    role: 'assistant',
    content: responseContent,
    timestamp: new Date().toISOString(),
    sources: sources.length ? sources : undefined,
  };
  chatHistory[req.user.id].push(assistantMsg);

  res.json({
    userMessage: userMsg,
    assistantMessage: assistantMsg,
  });
});

// DELETE /api/ai-assistant/history — clear chat
router.delete('/history', authenticate, (req, res) => {
  chatHistory[req.user.id] = [];
  res.json({ message: 'Chat history cleared.' });
});

module.exports = router;
