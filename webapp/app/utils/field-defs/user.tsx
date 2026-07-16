import { createColumnHelper } from "@tanstack/react-table";
import { selectOptionsEditor, textInputEditor } from "../field-editors";
import type { UserDto } from "@backend/database/dtos";
import { RoleBadge } from "~/components/role-badge";
import type { Role } from "@backend/auth/permissions";

export const userFieldHelper = createColumnHelper<UserDto>();

export const userDefs = {
  email: userFieldHelper.accessor("email", {
    header: "Account",
    meta: {
      editor: textInputEditor(),
    },
  }),
  role: userFieldHelper.accessor("role", {
    header: "Role",
    cell: ({ getValue }) => (
      <RoleBadge value={getValue() as Role} />
    ),
    meta: {
      editor: selectOptionsEditor({
        options: [
          { label: "Trainee", value: "user" },
          { label: "Instructor", value: "instructor" },
          { label: "Admin", value: "admin" },
        ],
      }),
    },
  }),
};

export const userDefPresets = {
  all: [userDefs.email, userDefs.role],
};
