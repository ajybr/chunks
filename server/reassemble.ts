import { db } from "@/server/db"
import { chunkRefs, chunks, fileMetadata } from "@/server/db/schema"
import { eq, asc } from "drizzle-orm"
import crypto from "crypto"
import { BlobServiceClient } from "@azure/storage-blob"
import { env } from "@/lib/env"

const containerName = "chunks"

let blobServiceClient: BlobServiceClient | null = null

function getClient(): BlobServiceClient {
  if (!blobServiceClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(
      env.BLOB_STORAGE_CONNECTION_STRING
    )
  }
  return blobServiceClient
}

async function downloadChunk(checksum: string): Promise<Buffer> {
  const client = getClient()
  const containerClient = client.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(
    `chunks/${checksum}`
  )
  return await blockBlobClient.downloadToBuffer()
}

export async function reassembleFile(nodeId: string): Promise<Blob> {
  const refs = await db
    .select({
      sequence: chunkRefs.sequence,
      checksum: chunks.checksum,
    })
    .from(chunkRefs)
    .innerJoin(chunks, eq(chunkRefs.chunk_id, chunks.id))
    .where(eq(chunkRefs.node_id, nodeId))
    .orderBy(asc(chunkRefs.sequence))

  if (refs.length === 0) throw new Error(`No chunks found for node ${nodeId}`)

  const chunkBuffers = await Promise.all(
    refs.map(async (ref) => {
      const buf = await downloadChunk(ref.checksum)

      const hashBuf = crypto.createHash("sha256").update(buf).digest()
      const computed = hashBuf.toString("hex")

      if (computed !== ref.checksum) {
        throw new Error(`Chunk ${ref.sequence} integrity check failed`)
      }

      return buf
    })
  )

  const meta = await db
    .select({ mime_type: fileMetadata.mime_type })
    .from(fileMetadata)
    .where(eq(fileMetadata.node_id, nodeId))
    .limit(1)

  const mimeType = meta[0]?.mime_type ?? "application/octet-stream"

  const blobParts = chunkBuffers.map((b) => new Uint8Array(b))
  return new Blob(blobParts, { type: mimeType })
}
