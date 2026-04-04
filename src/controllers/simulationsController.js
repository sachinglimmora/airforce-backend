const { v4: uuidv4 } = require('uuid');
const Simulation = require('../models/Simulation');
const TraineeProgress = require('../models/TraineeProgress');

function formatDoc(doc) {
  const p = doc.toObject();
  delete p._id; delete p.__v;
  return p;
}

async function listSimulations(req, res) {
  try {
    const { type, difficulty, status, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { description: regex }];
    }

    const simulations = await Simulation.find(query);
    res.json(simulations.map(formatDoc));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function getSimulation(req, res) {
  try {
    const sim = await Simulation.findOne({ id: req.params.id });
    if (!sim) return res.status(404).json({ error: 'Simulation not found.' });
    res.json(formatDoc(sim));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function startSimulation(req, res) {
  try {
    const sim = await Simulation.findOne({ id: req.params.id });
    if (!sim) return res.status(404).json({ error: 'Simulation not found.' });
    if (sim.status === 'completed') {
      return res.status(400).json({ error: 'Simulation already completed.' });
    }
    sim.status = 'in-progress';
    await sim.save();
    res.json({ message: 'Simulation started.', simulation: formatDoc(sim) });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function completeSimulation(req, res) {
  try {
    const sim = await Simulation.findOne({ id: req.params.id });
    if (!sim) return res.status(404).json({ error: 'Simulation not found.' });

    const { score } = req.body;
    sim.status = 'completed';
    await sim.save();

    const userId = req.user.id;
    const progress = await TraineeProgress.findOne({ traineeId: userId });
    
    if (progress) {
      // Very simplisitic duration parse for mock data like "45 min" to 0.75 hrs
      const durationHours = parseFloat(sim.duration) / 60 || 1; 
      progress.simulationHours = parseFloat((progress.simulationHours + durationHours).toFixed(1));
      progress.recentActivity.unshift({
        id: uuidv4(),
        type: 'simulation-completed',
        title: sim.title,
        timestamp: new Date(),
        details: score ? `Score: ${score}%` : undefined,
      });
      await progress.save();
    }

    res.json({ message: 'Simulation completed.', simulation: formatDoc(sim) });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function createSimulation(req, res) {
  try {
    const { title, type, description, duration, difficulty, aircraft, objectives, briefing } = req.body;

    if (!title || !type || !description) {
      return res.status(400).json({ error: 'title, type and description are required.' });
    }

    const sim = await Simulation.create({
      id: uuidv4(),
      title,
      type,
      description,
      duration: duration || '30 min',
      difficulty: difficulty || 'intermediate',
      aircraft: aircraft || 'Su-30MKI',
      objectives: objectives || [],
      briefing: briefing || '',
      status: 'available',
    });

    res.status(201).json(formatDoc(sim));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateSimulation(req, res) {
  try {
    const sim = await Simulation.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!sim) return res.status(404).json({ error: 'Simulation not found.' });
    res.json(formatDoc(sim));
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

async function deleteSimulation(req, res) {
  try {
    const sim = await Simulation.findOneAndDelete({ id: req.params.id });
    if (!sim) return res.status(404).json({ error: 'Simulation not found.' });
    res.json({ message: 'Simulation deleted.' });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listSimulations,
  getSimulation,
  startSimulation,
  completeSimulation,
  createSimulation,
  updateSimulation,
  deleteSimulation,
};
