import { splitFile, hashFile } from "./chunker"

type UploadProgress = {
  total: number
  uploaded: number
  skipped: number
}

type ProgressCallback = (progress: UploadProgress) => void

export async function uploadFile(
  file: File,
  nodeId: string,
  onProgress?: ProgressCallback
) {
  const chunks = await splitFile(file)
  const fileHash = await hashFile(file)
  const total = chunks.length
  let uploaded = 0
  let skipped = 0

  const res = await fetch("/api/upload/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checksums: chunks.map((c) => c.checksum) }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `CAS check failed (${res.status})`)
  }

  const { results } = await res.json()

  for (const chunk of chunks) {
    const form = new FormData()
    form.append("checksum", chunk.checksum)
    form.append("node_id", nodeId)
    form.append("sequence", String(chunk.index))
    form.append("total_chunks", String(total))
    if (results[chunk.checksum]) {
      const r = await fetch("/api/upload/chunk", { method: "POST", body: form })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.error ?? `Chunk ref failed (${r.status})`)
      }
      skipped++
    } else {
      form.append("chunk", chunk.blob)
      const chunkRes = await fetch("/api/upload/chunk", {
        method: "POST",
        body: form,
      })
      if (!chunkRes.ok) {
        const err = await chunkRes.json().catch(() => ({}))
        throw new Error(err.error ?? `Chunk upload failed (${chunkRes.status})`)
      }
      uploaded++
    }

    onProgress?.({ total, uploaded, skipped })
  }

  return { fileHash, totalChunks: total, skipped }
}
