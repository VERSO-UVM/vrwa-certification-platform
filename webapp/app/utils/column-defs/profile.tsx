/**
 * This is an experiment to come up with a clean simple way
 * to make reusable table views. Simply expose the normal
 * column definitions and the view can either just use the standard
 * ones, or take or customize the ones that are suitable for that view.
 */
import type { Profile } from "@backend/database/schema";
import { createColumnHelper, type RowData } from "@tanstack/react-table";
import {
  type ColumnEditor,
  textInputEditor,
  selectOptionsEditor,
} from "~/components/field-editors";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    editor?: ColumnEditor<TData, TValue>;
  }
}

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
    _?: undefined & TData; /* ignore unused warning */
  }
}

// createColumnHelper just provides a stronger typed API to define ColumnDefs
// Note that assigning the result type becomes difficult https://github.com/TanStack/table/issues/4382
const columnHelper = createColumnHelper<Profile>();

export const profileColumnDefs = {
  // The keys are arbitary and don't have to match `accessorKey`, which is
  // also an optional field as we can also use `accessorFn`
  firstName: columnHelper.accessor("firstName", {
    header: "First Name",
    meta: {
      editor: textInputEditor(),
    },
  }),
  lastName: columnHelper.accessor("lastName", {
    header: "Last Name",
    meta: {
      editor: textInputEditor(),
    },
  }),
  address: columnHelper.accessor("address", {
    header: "Address",
    meta: {
      editor: textInputEditor(),
    },
  }),
  city: columnHelper.accessor("city", {
    header: "City",
    meta: {
      editor: textInputEditor(),
    },
  }),
  postalCode: columnHelper.accessor("postalCode", {
    header: "Postal Code",
    meta: {
      editor: textInputEditor(),
    },
  }),
  phoneNumber: columnHelper.accessor("phoneNumber", {
    header: "Phone Number",
    meta: {
      editor: textInputEditor(),
    },
  }),
  isMember: columnHelper.accessor("isMember", {
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

export const profileColumnSets = {
  /**
   * Done out like this just to make it visible how ProfileColumnDefs can
   * be customized nicely following a similar structure. You can put anything
   * in the self-executing lambda, it's nice for scoping, and it's important
   * to define ColumnDefs outside of the render function (though it is OK to
   * define them in the render function if you memoize with useMemo())
   */
  default: (() => {
    const { firstName, lastName, isMember } = profileColumnDefs;
    return [firstName, lastName, isMember];
  })(),

  // Object.values() is required to produce values in insertion order for String keys
  complete: Object.values(profileColumnDefs),
};
