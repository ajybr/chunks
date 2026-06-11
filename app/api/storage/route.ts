import { db } from "@/server/db"
import { node, fileMetadata } from "@/server/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const session = await auth()
    const owner = session.userId
    if (!owner) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [row] = await db
      .select({
        used: sql<number>`COALESCE(SUM(${fileMetadata.size}), 0)`,
        files: sql<number>`COUNT(*)`,
      })
      .from(node)
      .leftJoin(fileMetadata, eq(node.id, fileMetadata.node_id))
      .where(
        and(eq(node.owner, owner), eq(node.type, "file"), eq(node.is_deleted, false))
      )

    return Response.json({
      used: row?.used ?? 0,
      files: row?.files ?? 0,
      quota: 1_073_741_824,
    })
  } catch (err) {
    console.error("[api/storage] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
