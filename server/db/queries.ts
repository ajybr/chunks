import { eq, isNull, and, asc, sql } from "drizzle-orm"
import { db } from "."
import { fileMetadata, folderMetadata, node } from "./schema"

export type BreadcrumbItem = { id: string; name: string }

export function getChildren(node_id: string | null, owner: string) {
  return db
    .select({
      // shared fields
      id: node.id,
      name: node.name,
      type: node.type,
      parent_id: node.parent_id,
      modified_at: node.modified_at,
      is_deleted: node.is_deleted,
      owner: node.owner,
      // file metadata (null for folders)
      url: fileMetadata.url,
      size: fileMetadata.size,
      mime_type: fileMetadata.mime_type,
      // folder metadata (null for files)
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
      // folders first
      sql`CASE WHEN ${node.type} = 'folder' THEN -1 ELSE 1 END`,
      // then alphabetical
      asc(node.name)
    )
}

export async function getBreadcrumbPath(
  folderId: string,
  owner: string
): Promise<BreadcrumbItem[]> {
  const result = await db.execute(sql`
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

  return result[0] as unknown as BreadcrumbItem[]
}
