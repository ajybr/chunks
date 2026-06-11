import { db } from "@/server/db"
import { chunks, chunkRefs } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { publish, QUEUES, type ChunkUploadedPayload } from "@/server/rabbitmq"
import { uploadFileToBlobStorage } from "@/lib/blob"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { ZodError } from "zod"

const formSchema = z.object({
  checksum: z.string().min(1).max(64),
  node_id: z.string().min(1).max(36),
  sequence: z.coerce.number().int().nonnegative(),
  total_chunks: z.coerce.number().int().positive(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    const owner = session.userId
    if (!owner) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await req.formData()
    const raw = {
      checksum: form.get("checksum"),
      node_id: form.get("node_id"),
      sequence: form.get("sequence"),
      total_chunks: form.get("total_chunks"),
    }
    const parsed = formSchema.parse(raw)
    const { checksum, node_id: nodeId, sequence, total_chunks: total } = parsed

    const existing = await db
      .select()
      .from(chunks)
      .where(eq(chunks.checksum, checksum))
      .limit(1)

    let chunkId: string

    if (existing.length > 0) {
      chunkId = existing[0]!.id
    } else {
      const blob = form.get("chunk") as Blob | null
      if (!blob || blob.size === 0) {
        return Response.json(
          { error: "Missing chunk blob for new checksum" },
          { status: 400 }
        )
      }
      const buffer = await blob.arrayBuffer()
      const { url } = await uploadFileToBlobStorage(`chunks/${checksum}`, buffer)

      const newChunk = {
        id: crypto.randomUUID(),
        checksum,
        url,
        size: blob.size,
        created_at: new Date(),
      }
      await db.insert(chunks).values(newChunk)
      chunkId = newChunk.id
    }

    await db.insert(chunkRefs).values({
      node_id: nodeId,
      chunk_id: chunkId,
      sequence,
    })

    await publish<ChunkUploadedPayload>(QUEUES.CHUNK_UPLOADED, {
      node_id: nodeId,
      chunk_id: chunkId,
      sequence,
      total_chunks: total,
      owner,
    })

    return Response.json({ ok: true, chunk_id: chunkId })
  } catch (err) {
    if (err instanceof ZodError) {
      return Response.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      )
    }
    console.error("[upload/chunk] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
