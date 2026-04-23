const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const email = 'admin@mahatech.com';
    const password = 'Admin123!';

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      // Update role and verification status if user already exists
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.password = password;
      await existingAdmin.save();
      console.log('✅ Existing user updated to admin successfully');
    } else {
      // Create new admin user
      const admin = new User({
        name: 'Admin',
        email,
        password,
        role: 'admin',
        isVerified: true,
      });
      await admin.save();
      console.log('✅ Admin user created successfully');
    }

    console.log(`\n--- Admin Credentials ---`);
    console.log(`Email   : ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role    : admin`);
    console.log(`-------------------------\n`);

    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected. Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
