require('dotenv').config();

const { MongoClient } = require("mongodb");

const uri = process.env.DATABASE_URL;

if (!uri) {
  console.error("❌ DATABASE_URL is missing");
  process.exit(1);
}

const client = new MongoClient(uri);

async function test() {
  try {
    console.log("Connecting to MongoDB...");

    await client.connect();

    console.log("✅ MongoDB connected successfully");

    await client.db().command({ ping: 1 });

    console.log("✅ MongoDB ping successful");
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

test();