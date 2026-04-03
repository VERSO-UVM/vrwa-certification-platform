/**
 * This is an experiment to come up with a clean simple way
 * to make reusable table views. Simply expose the normal
 * column definitions and the view can either just use the standard
 * ones, or take or customize the ones that are suitable for that view.
 */
import type { Profile } from "@backend/database/schema";
import { createColumnHelper } from "@tanstack/react-table";
import {
  textInputEditor,
  selectOptionsEditor,
} from "~/utils/field-editors";

// createColumnHelper just provides a stronger typed API to define ColumnDefs
// Note that assigning the result type becomes difficult https://github.com/TanStack/table/issues/4382
export const profileFieldHelper = createColumnHelper<Profile>();

export const profileDefs = {
  // The keys are arbitary and don't have to match `accessorKey`, which is
  // also an optional field as we can also use `accessorFn`
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
    header: "Member",
    cell: ({ getValue }) => (getValue() == true ? "yes" : "no"),
    meta: {
      editor: selectOptionsEditor({
        options: [
          { label: "yes", value: true },
          { label: "no", value: false },
        ]
      }),
    }
  }),
};

export const profileDefPresets = {
  basic: [
    profileDefs.firstName,
    profileDefs.lastName,
    profileDefs.isMember,
  ],

  // Object.values() is required to produce values in insertion order for String keys
  all: Object.values(profileDefs),
};
