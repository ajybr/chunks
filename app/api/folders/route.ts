import { db } from "@/server/db"
import { node, folderMetadata } from "@/server/db/schema"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { ZodError } from "zod"

const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parent_id: z.string().max(36).nullable(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    const owner = session.userId
    if (!owner) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, parent_id } = createFolderSchema.parse(body)

    const id = crypto.randomUUID()
    const now = new Date()

    await db.insert(node).values({
      id,
      parent_id,
      owner,
      name,
      type: "folder",
      modified_at: now,
      is_deleted: false,
    })

    await db.insert(folderMetadata).values({
      node_id: id,
      item_count: 0,
    })

    return Response.json({ id })
  } catch (err) {
    if (err instanceof ZodError) {
      return Response.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      )
    }
    console.error("[api/folders] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
