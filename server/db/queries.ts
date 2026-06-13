import { eq, isNull, and, asc, sql } from "drizzle-orm"
import { db } from "."
import { fileMetadata, folderMetadata, node } from "./schema"
import type { BreadcrumbItem } from "@/lib/types"

export function getChildren(node_id: string | null, owner: string) {
  return db
    .select({
      id: node.id,
      name: node.name,
      type: node.type,
      parent_id: node.parent_id,
      modified_at: node.modified_at,
      is_deleted: node.is_deleted,
      deleted_at: node.deleted_at,
      is_favorite: node.is_favorite,
      favorited_at: node.favorited_at,
      owner: node.owner,
      url: fileMetadata.url,
      size: fileMetadata.size,
      mime_type: fileMetadata.mime_type,
      item_count: folderMetadata.item_count,
    })
    .from(node)
    .leftJoin(fileMetadata, eq(node.id, fileMetadata.node_id))
    .leftJoin(folderMetadata, eq(node.id, folderMetadata.node_id))
    .where(
      and(
        node_id ? eq(node.parent_id, node_id) : isNull(node.parent_id),
        eq(node.owner, owner),
        eq(node.is_deleted, false)
      )
    )
    .orderBy(
      sql`CASE WHEN ${node.type} = 'folder' THEN -1 ELSE 1 END`,
      asc(node.name)
    )
}

export async function getFavorites(owner: string) {
  return db
    .select({
      id: node.id,
      name: node.name,
      type: node.type,
      parent_id: node.parent_id,
      modified_at: node.modified_at,
      is_deleted: node.is_deleted,
      deleted_at: node.deleted_at,
      is_favorite: node.is_favorite,
      favorited_at: node.favorited_at,
      owner: node.owner,
      url: fileMetadata.url,
      size: fileMetadata.size,
      mime_type: fileMetadata.mime_type,
      item_count: folderMetadata.item_count,
    })
    .from(node)
    .leftJoin(fileMetadata, eq(node.id, fileMetadata.node_id))
    .leftJoin(folderMetadata, eq(node.id, folderMetadata.node_id))
    .where(and(eq(node.owner, owner), eq(node.is_favorite, true), eq(node.is_deleted, false)))
    .orderBy(asc(node.name))
}

export async function getBreadcrumbPath(
  folderId: string,
  owner: string
): Promise<BreadcrumbItem[]> {
  const [rows] = await db.execute(sql`
    WITH RECURSIVE ancestors AS (
      SELECT id, name, parent_id, 0 as depth
      FROM nodes_table
      WHERE id = ${folderId} AND owner = ${owner} AND is_deleted = false

      UNION ALL

      SELECT n.id, n.name, n.parent_id, a.depth + 1
      FROM nodes_table n
      JOIN ancestors a ON n.id = a.parent_id
      WHERE n.owner = ${owner} AND n.is_deleted = false
    )
    SELECT id, name FROM ancestors ORDER BY depth DESC
  `)

  const result = rows as unknown as Array<{ id: string; name: string }>
  return result.map((r) => ({ id: r.id, name: r.name }))
}

export async function getDeleted(owner: string) {
  return db
    .select({
      id: node.id,
      name: node.name,
      type: node.type,
      parent_id: node.parent_id,
      modified_at: node.modified_at,
      is_deleted: node.is_deleted,
      deleted_at: node.deleted_at,
      is_favorite: node.is_favorite,
      favorited_at: node.favorited_at,
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
}
