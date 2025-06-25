import { integer, pgTable, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const activityType = pgEnum("activity_type", ["Growth", "Maintenance", "Shrink"]);

export const entryTable = pgTable("entry", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 255 }).notNull(),
    type: activityType("activity_type").notNull(),
    timeStart: timestamp().notNull(),
    timeEnd: timestamp().notNull(),
    duration: integer().notNull(),
    notes: varchar({ length: 255 }).notNull(),
    userId: integer().references(() => usersTable.id).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
})
