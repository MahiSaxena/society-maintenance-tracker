require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@society.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
    role: 'admin',
  });

  console.log(`Admin created: ${email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});