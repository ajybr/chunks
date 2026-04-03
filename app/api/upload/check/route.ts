import { db } from "@/server/db"
import { chunks } from "@/server/db/schema"
import { inArray } from "drizzle-orm"

export async function POST(req: Request) {
  const { checksums }: { checksums: string[] } = await req.json()

  const existing = await db
    .select({ checksum: chunks.checksum })
    .from(chunks)
    .where(inArray(chunks.checksum, checksums))

  const existingSet = new Set(existing.map(r => r.checksum))

  // true = already stored, client skips upload
  // false = new chunk, client must upload
  return Response.json({
    results: Object.fromEntries(
      checksums.map(c => [c, existingSet.has(c)])
    )
  })
}