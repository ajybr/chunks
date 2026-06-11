import { db } from "@/server/db"
import { chunkRefs, chunks, fileMetadata } from "@/server/db/schema"
import { eq, asc } from "drizzle-orm"

export async function reassembleFile(nodeId: string): Promise<Blob> {
  // get chunks in sequence order
  const refs = await db
    .select({
      sequence: chunkRefs.sequence,
      url:      chunks.url,
      checksum: chunks.checksum,
    })
    .from(chunkRefs)
    .innerJoin(chunks, eq(chunkRefs.chunk_id, chunks.id))
    .where(eq(chunkRefs.node_id, nodeId))
    .orderBy(asc(chunkRefs.sequence))

  if (refs.length === 0) throw new Error(`No chunks found for node ${nodeId}`)

  // download all chunks in parallel
  const buffers = await Promise.all(
    refs.map(async (ref) => {
      const res = await fetch(ref.url)
      if (!res.ok) throw new Error(`Failed to fetch chunk ${ref.sequence}: ${ref.url}`)

      const buffer   = await res.arrayBuffer()

      // verify integrity — recompute hash and compare
      const hash     = await crypto.subtle.digest("SHA-256", buffer)
      const computed = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")

      if (computed !== ref.checksum) {
        throw new Error(`Chunk ${ref.sequence} integrity check failed`)
      }

      return buffer
    })
  )

  // mime type from metadata
  const meta = await db
    .select({ mime_type: fileMetadata.mime_type })
    .from(fileMetadata)
    .where(eq(fileMetadata.node_id, nodeId))
    .limit(1)

  const mimeType = meta[0]?.mime_type ?? "application/octet-stream"

  // concatenate all buffers into one Blob
  return new Blob(buffers, { type: mimeType })
}