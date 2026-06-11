import { reassembleFile } from "@/server/reassemble"
import { db } from "@/server/db"
import { fileMetadata, node } from "@/server/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

export async function GET(
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

    const meta = await db
      .select({ name: node.name, mime_type: fileMetadata.mime_type })
      .from(node)
      .leftJoin(fileMetadata, eq(node.id, fileMetadata.node_id))
      .where(and(eq(node.id, id), eq(node.owner, owner)))
      .limit(1)

    if (meta.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    const blob = await reassembleFile(id)

    return new Response(blob, {
      headers: {
        "Content-Type": meta[0]!.mime_type ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${meta[0]!.name}"`,
      },
    })
  } catch (err) {
    console.error("[api/nodes/download] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
