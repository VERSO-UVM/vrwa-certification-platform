import { createColumnHelper, flexRender } from "@tanstack/react-table";
import { selectOptionsEditor, textInputEditor } from "../field-editors";
import type { UserDto } from "@backend/database/dtos";
import { RoleBadge } from "~/components/role-badge";
import type { Role } from "@backend/auth/permissions";
import { profileFullName } from "../utils";

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
    cell: ({ getValue }) => <RoleBadge value={getValue() as Role} />,
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
  profiles: userFieldHelper.accessor(
    (row) => row.profiles.map(profileFullName).join("\n"),
    {
      header: "Profiles",
      cell: ({ row }) => {
        // Don't display too many names here
        // Hide any more than MAX_PROFILES_DISPLAY
        const MAX_PROFILES_DISPLAY = 9;
        let names = row.original.profiles.map(profileFullName);
        if (names.length > MAX_PROFILES_DISPLAY) {
          return (
            <>
              {names.slice(0, MAX_PROFILES_DISPLAY).map((name) => (
                <div className="text-xs font-medium" key={name}>
                  {name}
                </div>
              ))}
              <div className="text-xs">
                [+{names.length - MAX_PROFILES_DISPLAY} not shown]
              </div>
            </>
          );
        }
        return names.map((name) => (
          <div className="text-xs font-medium" key={name}>
            {name}
          </div>
        ));
      },
      meta: {
        editor: ({ ctx }) => flexRender(ctx.cell.column.columnDef.cell, ctx),
      },
    },
  ),
};

export const userDefPresets = {
  all: [userDefs.email, userDefs.role],
};
