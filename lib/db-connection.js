const { Client } = require("pg");

// Replace with your actual database URL
const DATABASE_URL = "postgresql://neondb_owner:npg_0bjCgVyucF2K@ep-noisy-dream-a1ubyfkk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Important for NeonDB
  },
});

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to Neon PostgreSQL database!");

    // Check if the connection works by running a simple query
    const res = await client.query("SELECT NOW();");
    console.log("🕒 Current Time from DB:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Error connecting to database:", err.message);
  } finally {
    await client.end();
    console.log("🔌 Connection closed.");
  }
}

testConnection();
