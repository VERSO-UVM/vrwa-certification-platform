/**
 * This is an experiment to come up with a clean simple way
 * to make highly modular and reusable CRUD interfaces. In
 * this file, we just expose a set of ColumnDefs in an
 * easy to access way. Anyone can use one of the "presets",
 * or choose their own order and selection from `profileDefs`,
 * or build off any of these structures using JS array and
 * object manipulations.
 */
import type { Profile } from "@backend/database/schema";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { textInputEditor, selectOptionsEditor } from "~/utils/field-editors";

// createColumnHelper just provides a stronger typed API to define ColumnDefs
// Note that assigning the result type becomes difficult https://github.com/TanStack/table/issues/4382
export const profileFieldHelper = createColumnHelper<Profile>();

export const profileDefs = {
  firstName: profileFieldHelper.accessor("firstName", {
    header: "First Name",
    meta: {
      editor: textInputEditor(),
    },
  }),
  lastName: profileFieldHelper.accessor("lastName", {
    header: "Last Name",
    meta: {
      editor: textInputEditor(),
    },
  }),
  address: profileFieldHelper.accessor("address", {
    header: "Address",
    meta: {
      editor: textInputEditor(),
    },
  }),
  city: profileFieldHelper.accessor("city", {
    header: "City",
    meta: {
      editor: textInputEditor(),
    },
  }),
  postalCode: profileFieldHelper.accessor("postalCode", {
    header: "Postal Code",
    meta: {
      editor: textInputEditor(),
    },
  }),
  phoneNumber: profileFieldHelper.accessor("phoneNumber", {
    header: "Phone Number",
    meta: {
      editor: textInputEditor(),
    },
  }),
  isMember: profileFieldHelper.accessor("isMember", {
    header: "Member?",
    cell: ({ getValue }) => {
      switch (getValue()) {
        case true:
          return <Badge variant="outline">Yes</Badge>;
        case false:
          return <Badge variant="default">No</Badge>;
      }
    },
    meta: {
      editor: selectOptionsEditor({
        options: [
          { label: "yes", value: true },
          { label: "no", value: false },
        ],
      }),
    },
  }),
};

export const profileDefPresets = {
  basic: [profileDefs.firstName, profileDefs.lastName, profileDefs.isMember],

  // Object.values() is required to produce values in insertion order for String keys
  all: Object.values(profileDefs),
};
