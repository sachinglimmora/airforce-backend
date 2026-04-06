const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Simulation = require('../models/Simulation');
const TraineeProgress = require('../models/TraineeProgress');
const AuditLog = require('../models/AuditLog');

const { users, courses, modules, simulations, traineeProgress, auditLogs } = require('../data/db');
const connectDB = require('../config/db');

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Course.deleteMany({});
  await Module.deleteMany({});
  await Simulation.deleteMany({});
  await TraineeProgress.deleteMany({});
  await AuditLog.deleteMany({});

  console.log('Inserting seed data...');
  
  await User.insertMany(users);
  console.log(`Inserted ${users.length} users.`);

  await Course.insertMany(courses);
  console.log(`Inserted ${courses.length} courses.`);

  await Module.insertMany(modules);
  console.log(`Inserted ${modules.length} modules.`);

  await Simulation.insertMany(simulations);
  console.log(`Inserted ${simulations.length} simulations.`);

  // format traineeProgress from object to array
  const progressArr = Object.entries(traineeProgress).map(([traineeId, data]) => ({
    traineeId,
    ...data
  }));
  await TraineeProgress.insertMany(progressArr);
  console.log(`Inserted ${progressArr.length} trainee progress records.`);

  await AuditLog.insertMany(auditLogs);
  console.log(`Inserted ${auditLogs.length} audit logs.`);

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
