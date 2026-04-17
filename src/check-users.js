const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

async function check() {
  await connectDB();
  const count = await User.countDocuments({});
  console.log(`Total users in DB: ${count}`);
  const users = await User.find({}, { email: 1, role: 1 });
  console.log('Users:', JSON.stringify(users, null, 2));
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
