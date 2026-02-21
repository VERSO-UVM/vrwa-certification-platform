"use client";

import { useState } from "react"; 
import { type ColumnDef } from "@tanstack/react-table"; 
import { useQueryClient } from "@tanstack/react-query"; 
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardTitle } from "app/components/ui/card"; 
import { Button } from "app/components/ui/button"; 
import { ButtonGroup } from "~/components/ui/button-group"; 
import { DataTable } from "~/components/ui/data-table";
import type { CourseEvent } from "../../../backend/src/database/schema";

function useCourseEvents() { 
    const trpc = useTRPC(); 
    return trpc.adminRouter.getCourseEvents.useQuery();
}

function useUpdateCourseEvent() {
    const trpc = useTRPC(); 
    const queryClient = useQueryClient();
    return trpc.courseManagerRouter.updateCourseEvent.useMutation({
         onSuccess: async () => { 
            await queryClient.invalidateQueries({ 
                queryKey: trpc.adminRouter.getCourseEvents.queryKey(), 
            }); 
        }, 
    });
}

function useDeleteCourseEvent() {
    const trpc = useTRPC(); 
    const queryClient = useQueryClient();
    return trpc.courseManagerRouter.deleteCourseEvent.useMutation({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: trpc.adminRouter.getCourseEvent.queryKey(),
            })
        }
    })
}


export function CourseManager() {

    const courseEvents =  useCourseEvents();
    const updateCourseEvent = useUpdateCourseEvent();
    const deleteCourseEvent = useDeleteCourseEvent();

    //for tracking inline edits
    const [editingId, setEditingId] = useState<string | null>(null);
    const [edits, setEdits] = useState<Partial<CourseEvent>>({});
    
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
        cancelEditing();
    }


    const columns: ColumnDef<CourseEvent>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "physicalAddress",
            header: "Address",
            cell: ({ row }) =>
                editingId === row.original.id ? (
                    <input
                        value={edits.physicalAddress ?? ""}
                        onChange={(e) =>
                            setEdits((prev) => ({...prev, physicalAddress: e.target.value}))
                            }
                            className="border p-1"
                        />
                ) : (row.original.physicalAddress ?? '-'),
        },
        {
            accessorKey: "locationType",
            header: "Class Type",
            cell: ({ row }) =>
                editingId === row.original.id ? (
                        <select
                            value={edits.locationType}
                            onChange={(e) =>
                                setEdits((prev) => ({
                                    ...prev,
                                    locationType: e.target.value as
                                        | "in-person"
                                        | "virtual"
                                        | "hybrid",
                                }))
                            }
                            className="border p-1"
                        >
                            <option value="in-person">In Person</option>
                            <option value="virtual">Virtual</option>
                            <option value="hybrid">Hybrid</option>
                            </select>
                ) : ( row.original.locationType),
        },
        {
            accessorKey: "seats",
            header: "Seats",
            cell: ({ row }) => {
                editingId === row.original.id ? (
                    <input 
                        type="number"
                        value={edits.seats ?? ""}
                        onChange={(e) => 
                            setEdits((prev) => ({
                                ...prev,
                                seats: Number(e.target.value),
                            }))
                        }
                        className="border p-1 w-20"
                    /> ) : ( row.original.seats ?? "-")
            },
        },
        {
            accessorKey: "classStartDatetime",
            header: "Start Date",
            cell: ({ row }) => 
                editingId === row.original.id ? (
                    <input 
                        type="datetime-local"
                        value={
                            edits.classStartDatetime
                            ? new Date(edits.classStartDatetime).toISOString().slice(0, 16) : ""
                        } 
                        onChange={(e) =>
                            setEdits((prev) => ({...prev, classStartDatetime: new Date(e.target.value)}))
                        }
                        className="border p-1"
                    />
                ) :  row.original.classStartDatetime ? (
                     new Date(row.original.classStartDatetime).toLocaleString()) :  ( "-" ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const isEditing = editingId === row.original.id;

                if (isEditing) {
                    return (
                        <ButtonGroup>
                            <Button 
                                variant="secondary"
                                onClick={saveEditing}
                                disabled={updateCourseEvent.isPending}
                                >Save</Button>
                            <Button 
                                variant="secondary"
                                onClick= {cancelEditing}
                                >Cancel</Button>
                        </ButtonGroup>
                    );
                }

                return (
                    <ButtonGroup>
                        <Button 
                            variant="secondary"
                            onClick ={ () => editRow(row.original)}
                            >Edit
                        </Button>
                        <Button 
                            variant= "destructive"
                            onClick={() => deleteCourseEvent.mutate({ id: row.original.id })}
                            disabled={deleteCourseEvent.isPending}
                            >Delete
                        </Button>
                    </ButtonGroup>
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
                <DataTable columns={columns} data={courseEvents.data ?? []} />
              </CardContent>
            </Card>
          </div>
    </main>);

}