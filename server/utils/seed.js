require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

const seedData = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server unreachable
    });
    console.log('[Seed] Connected to MongoDB successfully.');

    // Clean existing seed demo user and data
    const demoEmail = 'demo@example.com';
    const existingUser = await User.findOne({ email: demoEmail });

    if (existingUser) {
      await Transaction.deleteMany({ user: existingUser._id });
      await Category.deleteMany({ user: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
      console.log('[Seed] Removed prior demo data');
    }

    // Create demo user
    const user = await User.create({
      name: 'Demo User',
      email: demoEmail,
      password: 'Password123!',
    });
    console.log(`[Seed] Created Demo User: ${user.email} (Password: Password123!)`);

    // Create custom categories
    const customCats = await Category.insertMany([
      { name: 'Fitness & Gym', user: user._id, isCustom: true },
      { name: 'Streaming & Media', user: user._id, isCustom: true },
      { name: 'Investments', user: user._id, isCustom: true },
    ]);
    console.log(`[Seed] Created ${customCats.length} custom categories`);

    // Generate transactions across the year (current year and recent months)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const sampleTransactions = [];

    // Past 6 months data for rich chart visualization
    for (let m = 0; m <= currentMonth; m++) {
      // Monthly Salary
      sampleTransactions.push({
        user: user._id,
        amount: 5500,
        type: 'income',
        category: 'Salary',
        date: new Date(Date.UTC(currentYear, m, 1, 9, 0)),
        note: `Monthly paycheck for month ${m + 1}`,
      });

      // Freelance / Investment Income
      if (m % 2 === 0) {
        sampleTransactions.push({
          user: user._id,
          amount: 850,
          type: 'income',
          category: 'Investments',
          date: new Date(Date.UTC(currentYear, m, 15, 14, 0)),
          note: 'Dividends & freelance side gig',
        });
      }

      // Rent
      sampleTransactions.push({
        user: user._id,
        amount: 1400,
        type: 'expense',
        category: 'Rent',
        date: new Date(Date.UTC(currentYear, m, 2, 10, 0)),
        note: 'Apartment rent',
      });

      // Groceries & Food
      sampleTransactions.push({
        user: user._id,
        amount: 280.5,
        type: 'expense',
        category: 'Food',
        date: new Date(Date.UTC(currentYear, m, 5, 18, 30)),
        note: 'Supermarket weekly grocery run',
      });
      sampleTransactions.push({
        user: user._id,
        amount: 72.0,
        type: 'expense',
        category: 'Food',
        date: new Date(Date.UTC(currentYear, m, 12, 20, 0)),
        note: 'Dinner with friends at Italian bistro',
      });

      // Travel / Commute
      sampleTransactions.push({
        user: user._id,
        amount: 115.0,
        type: 'expense',
        category: 'Travel',
        date: new Date(Date.UTC(currentYear, m, 8, 8, 30)),
        note: 'Fuel and metro card top-up',
      });

      // Bills
      sampleTransactions.push({
        user: user._id,
        amount: 160.0,
        type: 'expense',
        category: 'Bills',
        date: new Date(Date.UTC(currentYear, m, 10, 11, 0)),
        note: 'Electricity and fiber internet bill',
      });

      // Shopping
      sampleTransactions.push({
        user: user._id,
        amount: 195.0,
        type: 'expense',
        category: 'Shopping',
        date: new Date(Date.UTC(currentYear, m, 18, 16, 45)),
        note: 'New shoes and work apparel',
      });

      // Fitness & Gym
      sampleTransactions.push({
        user: user._id,
        amount: 65.0,
        type: 'expense',
        category: 'Fitness & Gym',
        date: new Date(Date.UTC(currentYear, m, 3, 7, 0)),
        note: 'Gym monthly membership',
      });

      // Streaming & Media
      sampleTransactions.push({
        user: user._id,
        amount: 29.99,
        type: 'expense',
        category: 'Streaming & Media',
        date: new Date(Date.UTC(currentYear, m, 20, 12, 0)),
        note: 'Netflix & Spotify subscriptions',
      });
    }

    await Transaction.insertMany(sampleTransactions);
    console.log(
      `[Seed] Inserted ${sampleTransactions.length} transactions successfully.`
    );
    console.log('\n=======================================');
    console.log('Seed Complete!');
    console.log(`Demo Credentials:`);
    console.log(`Email:    demo@example.com`);
    console.log(`Password: Password123!`);
    console.log('=======================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`\n[Seed Error]: ${error.message}`);
    console.error(
      'Tip: MongoDB is not reachable. If you do not have MongoDB installed locally, you can create a free cluster on MongoDB Atlas (https://www.mongodb.com/atlas) and paste your connection string into server/.env:\n' +
      'MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/expense_tracker?retryWrites=true&w=majority\n'
    );
    process.exit(1);
  }
};

seedData();
