
import { integer, pgTable, timestamp, varchar, text, jsonb, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { users } from "./auth";

const timestamps = {
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}

export const classStatusEnum = pgEnum('class_status', ['active', 'inactive', 'archived']);

export const departments = pgTable("departments", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', { length: 10 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }),
    ...timestamps
});

export const subjects = pgTable("subjects", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId: integer('department_id').notNull().references(() => departments.id, { onDelete: 'restrict' }),
    code: varchar('code', { length: 10 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }),
    ...timestamps
});

export const classes = pgTable("classes", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
    teacherId: text('teacher_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
    inviteCode: varchar('invite_code', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    capacity: integer('capacity').notNull().default(50),
    status: classStatusEnum('status').notNull().default('active'),
    schedules: jsonb('schedules').$type<{ day: string; startTime: string; endTime: string }[]>(),
    ...timestamps,
}, (table) => [
    index("idx_classes_subject_id").on(table.subjectId),
    index("idx_classes_teacher_id").on(table.teacherId),
]);

export const enrollments = pgTable("enrollments", {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
    ...timestamps,
}, (table) => [
    uniqueIndex("uq_enrollments_student_class").on(table.studentId, table.classId),
    index("idx_enrollments_student_id").on(table.studentId),
    index("idx_enrollments_class_id").on(table.classId),
]);

export const departmentRelations = relations(departments, ({ many }) => ({
    subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
    department: one(departments, {
        fields: [subjects.departmentId],
        references: [departments.id]
    }),
    classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
    subject: one(subjects, {
        fields: [classes.subjectId],
        references: [subjects.id],
    }),
    teacher: one(users, {
        fields: [classes.teacherId],
        references: [users.id],
    }),
    enrollments: many(enrollments),
}));

export const enrollmentRelations = relations(enrollments, ({ one }) => ({
    student: one(users, {
        fields: [enrollments.studentId],
        references: [users.id],
    }),
    class: one(classes, {
        fields: [enrollments.classId],
        references: [classes.id],
    }),
}));

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;