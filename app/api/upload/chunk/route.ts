import { db } from "@/server/db"
import { chunks, chunkRefs } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { publish, QUEUES, type ChunkUploadedPayload } from "@/server/rabbitmq"

export async function POST(req: Request) {
  const form      = await req.formData()
  const blob      = form.get("chunk") as Blob
  const checksum  = form.get("checksum") as string
  const nodeId    = form.get("node_id") as string
  const sequence  = parseInt(form.get("sequence") as string)
  const total     = parseInt(form.get("total_chunks") as string)
  const owner     = form.get("owner") as string

  const existing = await db
    .select()
    .from(chunks)
    .where(eq(chunks.checksum, checksum))
    .limit(1)

  let chunkId: string

  if (existing.length > 0) {
    chunkId = existing[0]!.id
  } else {
    const buffer = await blob.arrayBuffer()
    const { url } = await put(`chunks/${checksum}`, buffer, { access: "private" })

    const newChunk = {
      id:         crypto.randomUUID(),
      checksum,
      url,
      size:       blob.size,
      created_at: new Date(),
    }
    await db.insert(chunks).values(newChunk)
    chunkId = newChunk.id
  }

  //chunk mapping
  await db.insert(chunkRefs).values({
    node_id:  nodeId,
    chunk_id: chunkId,
    sequence,
  })

  // publish event assembler worker checks if all chunks are in
  await publish<ChunkUploadedPayload>(QUEUES.CHUNK_UPLOADED, {
    node_id:      nodeId,
    chunk_id:     chunkId,
    sequence,
    total_chunks: total,
    owner,
  })

  return Response.json({ ok: true, chunk_id: chunkId })
}