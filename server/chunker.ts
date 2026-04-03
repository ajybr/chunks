export const CHUNK_SIZE = 5 * 1024 * 1024  

export type FileChunk = {
  index:    number
  blob:     Blob
  checksum: string
  size:     number
}

// splits file and computes SHA-256 per chunk client-side
export async function splitFile(file: File): Promise<FileChunk[]> {
  const chunks: FileChunk[] = []

  for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
    const blob     = file.slice(offset, offset + CHUNK_SIZE)
    const buffer   = await blob.arrayBuffer()
    const hash     = await crypto.subtle.digest("SHA-256", buffer)
    const checksum = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    chunks.push({ index: chunks.length, blob, checksum, size: blob.size })
  }

  return chunks
}

// computes SHA-256 of the full file stored in file_metadata for integrity check
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hash   = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
}