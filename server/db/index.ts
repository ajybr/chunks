import { env } from "@/lib/env"
import { drizzle } from "drizzle-orm/singlestore"
import mysql from "mysql2/promise"

const poolConnection = mysql.createPool(env.DATABASE_URL)

export const db = drizzle(poolConnection as never)
