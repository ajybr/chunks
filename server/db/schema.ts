import { boolean, index, int, bigint, singlestoreTable, timestamp, varchar } from "drizzle-orm/singlestore-core"

export const node = singlestoreTable("nodes_table", {
  id:          varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  parent_id:   varchar({ length: 36 }),
  owner:       varchar({ length: 255 }).notNull(),
  name:        varchar({ length: 255 }).notNull(),
  type:        varchar({ length: 10 }).notNull(),  // "file" | "folder"
  modified_at: timestamp().notNull(),
  is_deleted:  boolean().notNull().default(false),
  deleted_at:  timestamp(),
  is_favorite:  boolean().notNull().default(false),
  favorited_at: timestamp(),
},
(t) => [
  index("idx_parent").on(t.parent_id),
  index("idx_owner").on(t.owner),
])

export const fileMetadata = singlestoreTable("file_metadata_table", {
  node_id:   varchar({ length: 36 }).primaryKey(),  
  url:       varchar({ length: 255 }).notNull(),     
  size:      bigint({ unsigned: true, mode: "number" }).notNull(),                       
  mime_type: varchar({ length: 127 }).notNull(),     
})

export const folderMetadata = singlestoreTable("folder_metadata_table", {
  node_id:    varchar({ length: 36 }).primaryKey(),  
  item_count: int().notNull().default(0),            
})

export const chunks = singlestoreTable("chunks_table", {
  id:         varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  checksum:   varchar({ length: 64 }).notNull(),   // SHA-256 — the CAS key
  url:        varchar({ length: 255 }).notNull(),   
  size:       int().notNull(),
  created_at: timestamp().notNull(),
},
(t) => [index("idx_chunks_checksum").on(t.checksum)])  // dedup lookups hit this index

// maps a file node to its ordered chunks
export const chunkRefs = singlestoreTable("chunk_refs_table", {
  id:       varchar({ length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  node_id:  varchar({ length: 36 }).notNull(),   // FK → nodes.id
  chunk_id: varchar({ length: 36 }).notNull(),   // FK → chunks.id
  sequence: int().notNull(),                     // order to reassemble
},
(t) => [index("idx_chunkrefs_node").on(t.node_id)])