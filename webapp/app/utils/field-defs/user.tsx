import type { UserDto } from "@backend/database/dtos";
import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { selectOptionsEditor } from "~/utils/field-editors";
import { format } from "date-fns";

export const userFieldHelper = createColumnHelper<UserDto>();

const labelByRole = {
  user: "Operator",
  instructor: "Instructor",
  admin: "Admin",
} as const;

export const userDefs = {
  email: userFieldHelper.accessor("email", {
    header: "Email",
  }),
  name: userFieldHelper.accessor("name", {
    header: "Name",
  }),
  role: userFieldHelper.accessor("role", {
    header: "Role",
    cell: ({ getValue }) => {
      const value = getValue();
      const key = (value ?? "user") as keyof typeof labelByRole;
      return <Badge variant="outline">{labelByRole[key]}</Badge>;
    },
    meta: {
      editor: selectOptionsEditor({
        options: [
          { label: "Operator", value: "user" },
          { label: "Instructor", value: "instructor" },
          { label: "Admin", value: "admin" },
        ],
      }),
    },
  }),
  createdAt: userFieldHelper.accessor("createdAt", {
    header: "Joined",
    cell: ({ getValue }) => format(new Date(getValue()), "PPP"),
  }),
};

export const userDefPresets = {
  basic: [userDefs.email, userDefs.name, userDefs.role],
  all: Object.values(userDefs),
};

export type { UserDto };
