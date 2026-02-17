import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import type { Profile, CourseEvent, Reservation } from "../../../backend/src/database/schema";
import { DataTable } from "~/components/ui/data-table";

const courseEventTableDef: ColumnDef<CourseEvent>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "physicalAddress",
        header: "Address"
    },
    {
        accessorKey: "locationType",
        header: "Class Type"
    },
    {
        accessorKey: "seats",
        header: "Seats"
    },
    {
        accessorKey: "classStartDatetime",
        header: "Start Date",
        cell: ({ getValue }) =>
            new Date(getValue() as string).toLocaleString(),
    },
];

export function CourseEventManager() {
    const trpc = useTRPC();

    const courseEvents = useQuery(
        trpc.adminRouter.getCourseEvents.queryOptions()
    );

    return(
    <main className="flex flex-wrap items-center justify-center py-4 gap-4">
          <div className="w-full flex justify-center">
            <Card className="min-w-md">
              <CardTitle className="text-center">Upcoming Classes</CardTitle>
              <CardContent>
                <DataTable columns={courseEventTableDef} data={courseEvents.data ?? []} />
              </CardContent>
            </Card>
          </div>
    </main>);

}