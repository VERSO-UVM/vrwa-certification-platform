import {
  createAccessControl,
  type AuthorizeResponse,
} from 'better-auth/plugins/access';
import {
  defaultStatements,
  adminAc,
  userAc,
} from 'better-auth/plugins/admin/access';

/**
 * See docs on how to write permissions
 * https://www.better-auth.com/docs/plugins/admin#access-control
 */

const statements = {
  certifications: ['view', 'update', 'assign'], // System configuration; key value table in postgres
  invoices: ['view', 'pay', 'delete'],
  classes: ['register', 'update'],
  roster: ['view', 'update'],
} as const;

export const ac = createAccessControl({ ...defaultStatements, ...statements });

// This admin role represents a VRWA administrator, not a local organization administrator.
// @ts-expect-error The type is correct; this just ensures that administrators have all permissions.
const admin = ac.newRole({
  ...adminAc.statements,
  ...statements,
});

const instructor = ac.newRole({
  ...userAc.statements,
  certifications: ['assign'],
  classes: ['update'],
  roster: ['view'],
});

const user = ac.newRole({
  ...userAc.statements,
  certifications: ['view'],
  classes: ['register'],
  invoices: ['view'],
});

export const roles = {
  admin,
  user,
  instructor,
} as const;

type Role = keyof typeof roles;

type PermissionsCheckInput = {
  permissions: Parameters<ReturnType<(typeof ac)['newRole']>['authorize']>[0];
} & (
  | { role: keyof typeof roles; roles?: never }
  | { roles: string; role?: never }
);

export function checkRolePermission(options: PermissionsCheckInput) {
  const _roles = (
    options.roles ? options.roles.split(',') : [options.role]
  ) as (keyof typeof roles)[];

  if (_roles.length === 0) return false;

  if (_roles.includes('admin')) return true;

  for (const role of _roles) {
    const _role = roles[role];
    // @ts-expect-error It's weird
    const result = _role?.authorize(options.permissions) as AuthorizeResponse;
    if (result?.success) {
      return true;
    }
  }
  return false;
}

export function addRole(existingRole: string, roleToAdd: keyof typeof roles) {
  const _roles = (
    existingRole.length === 0 ? [] : existingRole.split(',')
  ) as Role[];
  if (_roles.includes(roleToAdd)) return _roles;
  _roles.push(roleToAdd);
  return _roles;
}

export function removeRole(
  existingRole: string,
  roleToRemove: keyof typeof roles,
) {
  let _roles = (
    existingRole.length === 0 ? [] : existingRole.split(',')
  ) as Role[];
  if (_roles.includes(roleToRemove)) {
    _roles = _roles.filter((r) => r !== roleToRemove);
  }
  return _roles;
}
