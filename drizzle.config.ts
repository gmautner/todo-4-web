import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations", // Directory for migration files
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Still read from process.env, now loaded by dotenv-cli
  },
  verbose: true,
  strict: true,
}); 