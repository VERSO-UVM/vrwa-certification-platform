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
} from "~/utils/column-editors";

// createColumnHelper just provides a stronger typed API to define ColumnDefs
// Note that assigning the result type becomes difficult https://github.com/TanStack/table/issues/4382
export const profileColumnHelper = createColumnHelper<Profile>();

export const profileColumnDefs = {
  // The keys are arbitary and don't have to match `accessorKey`, which is
  // also an optional field as we can also use `accessorFn`
  firstName: profileColumnHelper.accessor("firstName", {
    header: "First Name",
    meta: {
      editor: textInputEditor(),
    },
  }),
  lastName: profileColumnHelper.accessor("lastName", {
    header: "Last Name",
    meta: {
      editor: textInputEditor(),
    },
  }),
  address: profileColumnHelper.accessor("address", {
    header: "Address",
    meta: {
      editor: textInputEditor(),
    },
  }),
  city: profileColumnHelper.accessor("city", {
    header: "City",
    meta: {
      editor: textInputEditor(),
    },
  }),
  postalCode: profileColumnHelper.accessor("postalCode", {
    header: "Postal Code",
    meta: {
      editor: textInputEditor(),
    },
  }),
  phoneNumber: profileColumnHelper.accessor("phoneNumber", {
    header: "Phone Number",
    meta: {
      editor: textInputEditor(),
    },
  }),
  isMember: profileColumnHelper.accessor("isMember", {
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

export const profileColumnPresets = {
  /**
   * Done out like this just to make it visible how `profileColumnDefs` can
   * be customized nicely following a similar structure. You can put anything
   * in the IIFE function expression, it's nice for scoping, and it's important
   * to define ColumnDefs outside of the render function (though it is OK to
   * define them in the render function if you memoize with useMemo())
   */
  default: (() => {
    const { firstName, lastName, isMember } = profileColumnDefs;
    return [firstName, lastName, isMember];
  })(),

  // Object.values() is required to produce values in insertion order for String keys
  all: Object.values(profileColumnDefs),
};
