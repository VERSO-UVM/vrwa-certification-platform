import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { RowExpanding, selectRowsFn, type ColumnDef } from "@tanstack/react-table";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import type { Profile, CourseEvent, Reservation } from "../../../backend/src/database/schema";
import { DataTable } from "~/components/ui/data-table";
import { useState } from "react";

export function CourseManager() {

    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const courseEvents = useQuery(trpc.adminRouter.getCourseEvents.queryOptions());

    //for tracking inline edits
    const [editingId, setEditingId] = useState<string | null>(null);
    const [edits, setEdits] = useState<Partial<CourseEvent>>({});

    //editing a row
    const updateCourseEvent = useMutation({
        ...trpc.courseManagerRouter.updateCourseEvent.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.adminRouter.getCourseEvents.queryKey() });
            cancelEditing();
        },
    });
    

    //deleting an event
    const deleteCourseEvent = useMutation({
        ...trpc.courseManagerRouter.deleteCourseEvent.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.adminRouter.getCourseEvents.queryKey() });
        },
    });

    function editRow(row: CourseEvent) {
        setEditingId(row.id);
        setEdits({...row});
    }

    function cancelEditing() {
        setEditingId(null);
        setEdits({});
    }

    function saveEditing() {
        if (!editingId) return;

        updateCourseEvent.mutate({
            id: editingId,
            seats: edits.seats,
            locationType: edits.locationType,
            physicalAddress: edits.physicalAddress ?? null,
            virtualLink: edits.virtualLink ?? null,
            classStartDatetime: edits.classStartDatetime 
                ? new Date(edits.classStartDatetime)
                : undefined,
        });
    }


    const courseEventTableDef: ColumnDef<CourseEvent>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "physicalAddress",
            header: "Address",
            cell: ({ row, getValue }) => {
                const value = getValue<string | null>();

                if (editingId === row.original.id) {
                    return (
                        <input
                            value={edits.physicalAddress ?? ""}
                            onChange={(e) =>
                                setEdits({
                                    ...edits,
                                    physicalAddress: e.target.value,
                                })
                            }
                            className="border p-1"
                        />
                    );
                }
                return value ?? "-";
            },
        },
        {
            accessorKey: "locationType",
            header: "Class Type",
            cell: ({ row, getValue }) => {
                const value = getValue<string>();

                if (editingId === row.original.id) {
                    return (
                        <select
                            value={edits.locationType}
                            onChange={(e) =>
                                setEdits({
                                    ...edits,
                                    locationType: e.target.value as
                                        | "in-person"
                                        | "virtual"
                                        | "hybrid",
                                })
                            }
                            className="border p-1"
                        >
                            <option value="in-person">In Person</option>
                            <option value="virtual">Virtual</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    );
                }
                return value;
            }
        },
        {
            accessorKey: "seats",
            header: "Seats",
            cell: ({ row, getValue }) => {
                const value = getValue<number | null>();

                if (editingId === row.original.id) {
                    return (
                        <input 
                            type="number"
                            value={edits.seats ?? ""}
                            onChange={(e) => 
                                setEdits({
                                    ...edits,
                                    seats: Number(e.target.value),
                                })
                            }
                            className="border p-1 w-20"
                        />
                    );
                }
                return value ?? "-";
            },
        },
        {
            accessorKey: "classStartDatetime",
            header: "Start Date",
            cell: ({ row, getValue }) => {
                const value = getValue<Date | null>();

                if (editingId === row.original.id) {
                    return (
                        <input 
                            type="datetime-local"
                            value={
                                edits.classStartDatetime
                                ? new Date(edits.classStartDatetime).toISOString().slice(0, 16) : ""
                            } 
                            onChange={(e) =>
                                setEdits({
                                    ...edits,
                                    classStartDatetime: new Date(e.target.value),
                                })
                            }
                            className="border p-1"
                        />
                    );
                }
                return value ? new Date(value).toLocaleString() : "-";
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const isEditing = editingId === row.original.id;

                if (isEditing) {
                    return (
                        <div className="flex gap-2">
                            <button onClick={saveEditing}>Save</button>
                            <button onClick={cancelEditing}>Cancel</button>
                        </div>
                    );
                }

                return (
                    <div className="flex gap-2">
                        <button onClick={() => editRow(row.original)}>Edit</button>
                        <button onClick={() => deleteCourseEvent.mutate({ id: row.original.id })}>Delete</button>
                    </div>
                );
            },
        },
    ];

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