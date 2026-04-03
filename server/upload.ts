import { splitFile, hashFile } from "./chunker"

type UploadProgress = {
  total:     number
  uploaded:  number
  skipped:   number  
}

type ProgressCallback = (progress: UploadProgress) => void

export async function uploadFile(
  file:     File,
  nodeId:   string,
  owner:    string,
  onProgress?: ProgressCallback
) {
  const chunks   = await splitFile(file)
  const fileHash = await hashFile(file)
  const total    = chunks.length
  let uploaded   = 0
  let skipped    = 0

  const { results } = await fetch("/api/upload/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checksums: chunks.map(c => c.checksum) }),
  }).then(r => r.json())

  for (const chunk of chunks) {
    if (results[chunk.checksum]) {
      // CAS hit 
      // still need to create the chunk_ref so the file can be reassembled
      await fetch("/api/upload/chunk", {
        method: "POST",
        body: (() => {
          const form = new FormData()
          form.append("checksum",    chunk.checksum)
          form.append("node_id",     nodeId)
          form.append("sequence",    String(chunk.index))
          form.append("total_chunks", String(total))
          form.append("owner",       owner)
          // existing checksum  skips object store upload
          return form
        })(),
      })
      skipped++
    } else {
      // CAS miss 
      const form = new FormData()
      form.append("chunk",        chunk.blob)
      form.append("checksum",     chunk.checksum)
      form.append("node_id",      nodeId)
      form.append("sequence",     String(chunk.index))
      form.append("total_chunks", String(total))
      form.append("owner",        owner)

      await fetch("/api/upload/chunk", { method: "POST", body: form })
      uploaded++
    }

    onProgress?.({ total, uploaded, skipped })
  }

  return { fileHash, totalChunks: total, skipped }
}