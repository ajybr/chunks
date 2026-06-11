import { db } from "@/server/db"
import { node } from "@/server/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const owner = session.userId
    if (!owner) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await db
      .update(node)
      .set({ is_deleted: false, deleted_at: null, modified_at: new Date() })
      .where(and(eq(node.id, id), eq(node.owner, owner)))

    return Response.json({ ok: true })
  } catch (err) {
    console.error("[api/nodes/restore] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
