import { expect, test } from 'bun:test';
import { ac, addRole, checkRolePermission, removeRole } from './permissions';

test('admin permissions', () => {
  expect(
    checkRolePermission({
      role: 'admin',
      // @ts-expect-error Technically the types are not correct but this helps make sure stuff stays in sync
      permissions: ac.statements,
    }),
  ).toBe(true);

  expect(
    checkRolePermission({
      roles: 'user,admin',
      permissions: {
        user: ['ban'],
      },
    }),
  ).toBe(true);
});

test('instructor permissions', () => {
  expect(
    checkRolePermission({
      role: 'instructor',
      permissions: {
        certifications: ['assign'],
      },
    }),
  ).toBe(false);

  expect(
    checkRolePermission({
      roles: 'user',
      permissions: {
        classes: ['register'],
      },
    }),
  ).toBe(true);
});

const addRoleCases = [
  ['instructor,user', 'admin', 'instructor,user,admin'],
  ['instructor,user', 'user', 'instructor,user'],
  ['', 'admin', 'admin'],
];

const removeRoleCases = [
  ['admin,instructor,user', 'admin', 'instructor,user'],
  ['instructor,user', 'admin', 'instructor,user'],
  ['', 'admin', ''],
];

test.each(addRoleCases)(
  'Add role %p + %p == %p',
  (oldRoles, toAdd, newRoles) => {
    // @ts-expect-error Cannot narrow properly
    const r = addRole(oldRoles, toAdd).join(',');
    expect(r).toBe(newRoles);
    expect(r).toContain(toAdd);
  },
);

test.each(removeRoleCases)(
  'Add role %p + %p == %p',
  (oldRoles, toRm, newRoles) => {
    // @ts-expect-error Cannot narrow properly
    const r = removeRole(oldRoles, toRm).join(',');
    expect(r).toBe(newRoles);
    expect(r).not.toContain(toRm);
  },
);
