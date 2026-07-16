import { createColumnHelper } from "@tanstack/react-table";
import { selectOptionsEditor, textInputEditor } from "../field-editors";
import type { UserDto } from "@backend/database/dtos";

export const userFieldHelper = createColumnHelper<UserDto>();

export const userDefs = {
  email: userFieldHelper.accessor("email", {
    header: "email",
    meta: {
      editor: textInputEditor(),
    },
  }),
  role: userFieldHelper.accessor("role", {
    header: "role",
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
