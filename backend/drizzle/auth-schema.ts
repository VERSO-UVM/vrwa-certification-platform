import { defineRelationsPart } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { fsp: 3 }),
  stripeCustomerId: text("stripe_customer_id"),
});

export const session = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    activeOrganizationId: text("active_organization_id"),
    activeProfileId: text("active_profile_id"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    issuer: varchar("issuer", { length: 191 }).notNull(),
    accountId: varchar("account_id", { length: 191 }).notNull(),
    providerId: text("provider_id").notNull(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("account_issuer_accountId_uidx").on(
      table.issuer,
      table.accountId,
    ),
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = mysqlTable(
  "verification",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = mysqlTable(
  "organization",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

export const member = mysqlTable(
  "member",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 36 })
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 255 }).default("member").notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const invitation = mysqlTable(
  "invitation",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    organizationId: varchar("organization_id", { length: 36 })
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 255 }),
    status: varchar("status", { length: 255 }).default("pending").notNull(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    inviterId: varchar("inviter_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

export const authRelations = defineRelationsPart(
  { user, session, account, verification, organization, member, invitation },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      members: r.many.member({
        from: r.user.id,
        to: r.member.userId,
      }),
      invitations: r.many.invitation({
        from: r.user.id,
        to: r.invitation.inviterId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
    organization: {
      members: r.many.member({
        from: r.organization.id,
        to: r.member.organizationId,
      }),
      invitations: r.many.invitation({
        from: r.organization.id,
        to: r.invitation.organizationId,
      }),
    },
    member: {
      organization: r.one.organization({
        from: r.member.organizationId,
        to: r.organization.id,
      }),
      user: r.one.user({
        from: r.member.userId,
        to: r.user.id,
      }),
    },
    invitation: {
      organization: r.one.organization({
        from: r.invitation.organizationId,
        to: r.organization.id,
      }),
      user: r.one.user({
        from: r.invitation.inviterId,
        to: r.user.id,
      }),
    },
  }),
);
