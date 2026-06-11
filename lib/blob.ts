import { BlobServiceClient } from "@azure/storage-blob"
import { env } from "./env"

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

export async function uploadFileToBlobStorage(
  blobPath: string,
  buffer: ArrayBuffer
): Promise<{ url: string }> {
  const client = getClient()
  const containerClient = client.getContainerClient(containerName)
  await containerClient.createIfNotExists()

  const blockBlobClient = containerClient.getBlockBlobClient(blobPath)
  await blockBlobClient.uploadData(buffer)

  return { url: blockBlobClient.url }
}
