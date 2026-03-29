import { boolean } from "drizzle-orm/gel-core"
import { index, int, singlestoreTable, timestamp, varchar } from "drizzle-orm/singlestore-core"

export const files = singlestoreTable("files_table", {
  id: varchar({ length: 36 })
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID()),
  url: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  parent_id: varchar({length: 36}),
  size: int(),
  owner: varchar({ length: 255 }).notNull(),
  modified_at: timestamp('modified_at').notNull(),
  is_deleted: boolean().notNull().default(false),
}, 
(t) => {
  return [index("idx_files_parent").on(t.parent_id)]
})

export const folders = singlestoreTable("folders_table", {
   id: varchar({ length: 36 })
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID()),
  item_count: int().notNull().default(0),
  name: varchar({ length: 255 }).notNull(),
  parent_id: varchar({length: 36}),
  owner: varchar({ length: 255 }).notNull(),
  modified_at: timestamp('modified_at').notNull(),
  is_deleted: boolean().notNull().default(false),
}, 
(t) => {
  return [index("idx_folders_parent").on(t.parent_id)]
})
