/**
 * Access permissions using better-auth access
 * control plugin.
 *
 * See docs on how to write permissions
 * https://www.better-auth.com/docs/plugins/admin#access-control
 */

import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

const statements = {
  certifications: ["view", "update", "assign"], // System configuration; key value table in postgres
  invoices: ["view", "pay", "delete"],
  classes: ["register", "update"],
  roster: ["view", "update"],
} as const;

export const ac = createAccessControl({ ...defaultStatements, ...statements });

// This admin role represents a VRWA administrator, not a local organization administrator.
const admin = ac.newRole({
  ...adminAc.statements,
  ...statements,
  certifications: ["view", "assign"],
  classes: ["register", "update"],
  invoices: ["view"],
});

const instructor = ac.newRole({
  ...userAc.statements,
  certifications: ["assign"],
  classes: ["update", "register"],
  roster: ["view"],
});

const user = ac.newRole({
  ...userAc.statements,
  certifications: ["view"],
  classes: ["register"],
  invoices: ["view"],
});

export const roles = {
  admin,
  user,
  instructor,
} as const;

export type Role = keyof typeof roles;
