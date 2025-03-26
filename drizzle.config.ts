import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const dbUrl = new URL(process.env.DATABASE_URL!);

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // ✅ Required field
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 5432, // Default PostgreSQL port
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace("/", ""),
    ssl: true, // Set based on your DB configuration
  },
} satisfies Config;
