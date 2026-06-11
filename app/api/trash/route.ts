import { db } from "@/server/db"
import { fileMetadata, folderMetadata, node } from "@/server/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const session = await auth()
    const owner = session.userId
    if (!owner) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await db
      .select({
        id: node.id,
        name: node.name,
        type: node.type,
        parent_id: node.parent_id,
        modified_at: node.modified_at,
        is_deleted: node.is_deleted,
        deleted_at: node.deleted_at,
        owner: node.owner,
        url: fileMetadata.url,
        size: fileMetadata.size,
        mime_type: fileMetadata.mime_type,
        item_count: folderMetadata.item_count,
      })
      .from(node)
      .leftJoin(fileMetadata, eq(node.id, fileMetadata.node_id))
      .leftJoin(folderMetadata, eq(node.id, folderMetadata.node_id))
      .where(and(eq(node.owner, owner), eq(node.is_deleted, true)))
      .orderBy(asc(node.name))

    return Response.json({ items })
  } catch (err) {
    console.error("[api/trash] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
