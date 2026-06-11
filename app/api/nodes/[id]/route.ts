import { db } from "@/server/db"
import { node } from "@/server/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { z } from "zod"
import { ZodError } from "zod"

const renameSchema = z.object({
  name: z.string().min(1).max(255),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const owner = session.userId
    if (!owner) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name } = renameSchema.parse(body)

    await db
      .update(node)
      .set({ name, modified_at: new Date() })
      .where(and(eq(node.id, id), eq(node.owner, owner)))

    return Response.json({ ok: true })
  } catch (err) {
    if (err instanceof ZodError) {
      return Response.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 }
      )
    }
    console.error("[api/nodes/patch] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
