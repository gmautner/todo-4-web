import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enum for priority levels
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  description: text('description'),
  status: boolean('status').default(false).notNull(), // false = pending, true = completed
  priority: priorityEnum('priority').default('medium'),
  dueDate: timestamp('due_date'),
  tags: text('tags'), // Simple text field for comma-separated tags initially
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
});

// We might want a separate tags table later for better querying
// export const tagsTable = pgTable('tags', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 50 }).notNull().unique(),
// });

// export const taskTags = pgTable('task_tags', {
//   taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
//   tagId: integer('tag_id').references(() => tagsTable.id, { onDelete: 'cascade' }),
// }, (t) => ({
//   pk: primaryKey({ columns: [t.taskId, t.tagId] }),
// })); 