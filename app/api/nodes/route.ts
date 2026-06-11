import { db } from "@/server/db"
import { node, fileMetadata } from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { ZodError } from "zod"

const createFileSchema = z.object({
  name: z.string().min(1).max(255),
  parent_id: z.string().max(36).nullable(),
  size: z.number().int().nonnegative(),
  mime_type: z.string().max(127),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    const owner = session.userId
    if (!owner) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, parent_id, size, mime_type } = createFileSchema.parse(body)

    const id = crypto.randomUUID()
    const now = new Date()

    await db.insert(node).values({
      id,
      parent_id,
      owner,
      name,
      type: "file",
      modified_at: now,
      is_deleted: false,
    })

    await db.insert(fileMetadata).values({
      node_id: id,
      url: "",
      size,
      mime_type,
    })

    return Response.json({ id })
  } catch (err) {
    if (err instanceof ZodError) {
      return Response.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      )
    }
    console.error("[api/nodes] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
