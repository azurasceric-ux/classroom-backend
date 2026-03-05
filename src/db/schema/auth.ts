import { boolean, integer, pgEnum, pgTable, timestamp, varchar, text, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

const timestamps = {
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}
export const roleEnum = pgEnum('role', ['admin', 'teacher', 'student']);

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    role: roleEnum('role').default('student').notNull(),
    ...timestamps,
});

export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text("token").notNull().unique(),
    ...timestamps,
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [index("idx_sessions_user_id").on(table.userId)]);

export const account = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull().unique(),
    providerId: text('provider_id').notNull().unique(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
}, (table) => [index("idx_account_user_id").on(table.userId)]);

export const verfication = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ...timestamps,
}, (table) => [index("verification_identifier_idx").on(table.identifier)]);

export const userRelations = relations(users, ({ many }) => ({
    sessions: many(sessions),
    accounts: many(account),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(users, {
        fields: [account.userId],
        references: [users.id],
    }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verfication.$inferSelect;
export type NewVerification = typeof verfication.$inferInsert;