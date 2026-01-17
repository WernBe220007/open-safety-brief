import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const topic = pgTable("topic", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
});

export const incidentReason = pgTable("incident_reason", {
    id: uuid().primaryKey().defaultRandom(),
    reason: text().notNull(),
});

export const department = pgTable("department", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
});

export const incident = pgTable("incident", {
    id: uuid().primaryKey().defaultRandom(),
    date: timestamp({ withTimezone: true }).defaultNow().notNull(),
    department: uuid()
        .notNull()
        .references(() => department.id),
    reason: uuid()
        .notNull()
        .references(() => incidentReason.id),
    instructor: text().notNull(),
});

export const incidentTopics = pgTable("incident_topics", {
    incidentId: uuid()
        .notNull()
        .references(() => incident.id, { onDelete: "cascade" }),
    topicId: uuid()
        .notNull()
        .references(() => topic.id, { onDelete: "cascade" }),
});

export const topicSelection = pgTable("topic_selection", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
});

export const topicSelectionTopics = pgTable("topic_selection_topics", {
    topicSelectionId: uuid()
        .notNull()
        .references(() => topicSelection.id, { onDelete: "cascade" }),
    topicId: uuid()
        .notNull()
        .references(() => topic.id, { onDelete: "cascade" }),
});

export const signature = pgTable("signature", {
    id: uuid().primaryKey().defaultRandom(),
    incidentId: uuid()
        .notNull()
        .references(() => incident.id, { onDelete: "cascade" }),
    name: text().notNull(),
    signedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    signature: text().notNull(),
});

export const additionalPerson = pgTable("additional_person", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull()
});