import { index, int, singlestoreTable, timestamp, varchar } from "drizzle-orm/singlestore-core"

export const files = singlestoreTable("files_table", {
  id: int().primaryKey().autoincrement(),
  url: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  parent: int(),
  size: int(),
  owner: varchar({ length: 255 }).notNull(),
  dateModified: timestamp('modified_at').notNull(),
}, 
(t) => {
  return [index("idx_parent").on(t.parent)]
})

export const folders = singlestoreTable("folders_table", {
  id: int().primaryKey().autoincrement(),
  name: varchar({ length: 255 }).notNull(),
  parent: int(),
  size: int(),
  owner: varchar({ length: 255 }).notNull(),
  dateModified: timestamp('modified_at').notNull(),
}, 
(t) => {
  return [index("idx_parent").on(t.parent)]
})
