import { boolean } from "drizzle-orm/gel-core"
import { index, int, singlestoreTable, timestamp, varchar } from "drizzle-orm/singlestore-core"

export const node = singlestoreTable("nodes_table", {
  id:          varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  parent_id:   varchar({ length: 36 }),
  owner:       varchar({ length: 255 }).notNull(),
  name:        varchar({ length: 255 }).notNull(),
  type:        varchar({ length: 10 }).notNull(),  // "file" | "folder"
  modified_at: timestamp().notNull(),
  is_deleted:  boolean().notNull().default(false),
},
(t) => [
  index("idx_parent").on(t.parent_id),
  index("idx_owner").on(t.owner),
])

export const fileMetadata = singlestoreTable("file_metadata_table", {
  node_id:   varchar({ length: 36 }).primaryKey(),  // 1-to-1 with nodes
  url:       varchar({ length: 255 }).notNull(),     
  size:      int().notNull(),                       
  mime_type: varchar({ length: 127 }).notNull(),     
})

export const folderMetadata = singlestoreTable("folder_metadata_table", {
  node_id:    varchar({ length: 36 }).primaryKey(),  // 1-to-1 with nodes
  item_count: int().notNull().default(0),            
})