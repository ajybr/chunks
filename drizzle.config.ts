import { defineConfig } from "drizzle-kit"
import { env } from "./lib/env"

export default defineConfig({
  dialect: "singlestore",
  schema: "./server/db/schema.ts",
  dbCredentials: {
    database: env.SINGLESTORE_DB_NAME,
    host: env.SINGLESTORE_HOST,
    user: env.SINGLESTORE_USER,
    password: env.SINGLESTORE_PASS,
    port: Number(env.SINGLESTORE_PORT),
  },
})
