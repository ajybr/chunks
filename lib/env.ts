import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),

  SINGLESTORE_USER: z.string(),
  SINGLESTORE_PASS: z.string(),
  SINGLESTORE_HOST: z.string(),
  SINGLESTORE_PORT: z.string().default("3306"),
  SINGLESTORE_DB_NAME: z.string().default("chunks"),

  RABBITMQ_URL: z.string().url(),
  BLOB_STORAGE_CONNECTION_STRING: z.string(),

  // NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment variables:")
  console.error(parsed.error.format())
  throw new Error("Invalid environment variables - check .env file")
}

export const env = parsed.data
