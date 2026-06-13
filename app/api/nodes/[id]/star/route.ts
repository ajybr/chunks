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

    const existing = await db
      .select({ is_favorite: node.is_favorite })
      .from(node)
      .where(and(eq(node.id, id), eq(node.owner, owner)))
      .limit(1)

    if (existing.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    const isFav = existing[0]!.is_favorite
    const now = new Date()

    await db
      .update(node)
      .set({
        is_favorite: !isFav,
        favorited_at: isFav ? null : now,
        modified_at: now,
      })
      .where(and(eq(node.id, id), eq(node.owner, owner)))

    return Response.json({ ok: true, is_favorite: !isFav })
  } catch (err) {
    console.error("[api/nodes/star] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
