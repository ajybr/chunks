import { getFavorites } from "@/server/db/queries"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const session = await auth()
    const owner = session.userId
    if (!owner) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await getFavorites(owner)

    return Response.json({ items })
  } catch (err) {
    console.error("[api/favorites] Error:", err)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
