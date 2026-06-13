import { db } from "@/server/db"
import { chunkRefs, chunks } from "@/server/db/schema"
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
  try {
    return await blockBlobClient.downloadToBuffer()
  } catch (err) {
    console.error(`[reassemble] Failed to download chunk ${checksum}:`, err)
    throw new Error(`Failed to download chunk ${checksum} from blob storage`)
  }
}

export async function reassembleFile(nodeId: string, _mimeType?: string): Promise<Buffer> {
  const refs = await db
    .select({
      sequence: chunkRefs.sequence,
      checksum: chunks.checksum,
    })
    .from(chunkRefs)
    .innerJoin(chunks, eq(chunkRefs.chunk_id, chunks.id))
    .where(eq(chunkRefs.node_id, nodeId))
    .orderBy(asc(chunkRefs.sequence))

  if (refs.length === 0) {
    throw new Error(`No chunks found for node ${nodeId}. The file may not have been fully uploaded.`)
  }

  const chunkBuffers = await Promise.all(
    refs.map(async (ref) => {
      const buf = await downloadChunk(ref.checksum)

      const hashBuf = crypto.createHash("sha256").update(buf).digest()
      const computed = hashBuf.toString("hex")

      if (computed !== ref.checksum) {
        throw new Error(
          `Integrity check failed for chunk ${ref.sequence} of node ${nodeId}. ` +
          `Expected ${ref.checksum}, got ${computed}`
        )
      }

      return buf
    })
  )

  return Buffer.concat(chunkBuffers)
}
