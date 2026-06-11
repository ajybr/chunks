import { db } from "@/server/db"
import { chunks } from "@/server/db/schema"
import { inArray } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { ZodError } from "zod"

const bodySchema = z.object({
  checksums: z.array(z.string().min(1).max(64)).min(1),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { checksums } = bodySchema.parse(body)

    const existing = await db
      .select({ checksum: chunks.checksum })
      .from(chunks)
      .where(inArray(chunks.checksum, checksums))

    const existingSet = new Set(existing.map((r) => r.checksum))

    return Response.json({
      results: Object.fromEntries(
        checksums.map((c) => [c, existingSet.has(c)])
      ),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return Response.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      )
    }
    console.error("[upload/check] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
