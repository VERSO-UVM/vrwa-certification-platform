import { useQuery } from "@tanstack/react-query";
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable, type ColumnDef, type ColumnFiltersState } from "@tanstack/react-table";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { Profile } from "../../../backend/src/database/schema";
import React from "react";
import { Input } from "~/components/ui/input";


const columns: ColumnDef<Profile>[] = [
  {
    accessorKey: "accountId",
    header: "Account ID",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
]

export function Welcome() {
  const trpc = useTRPC();
  const profiles = useQuery(trpc.getProfiles.queryOptions());
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>();
  
  const table = useReactTable({
    data: profiles.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    }
  })
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <Card className="min-w-md">
        <CardTitle className="text-center">Welcome</CardTitle>
        <CardHeader>This is temporary!</CardHeader>
        <CardContent>
          <div>
            <a href="/login">Log in...</a>
          </div>
          <div>
            <a href="/signup">Sign up...</a>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-md">
        <CardTitle className="text-center">Profiles</CardTitle>
        <CardContent>
        
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter names..."
          value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("firstName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

        <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
