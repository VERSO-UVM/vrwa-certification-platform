import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTRPCClient, useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { DataTable } from "~/components/ui/data-table";
import type { CourseEvent } from "../../../backend/src/database/schema";
import { Calendar } from "~/components/ui/calendar";

function useCourseEvents() {
  const trpc = useTRPC();
  return useQuery(trpc.adminRouter.getCourseEvents.queryOptions());
}

export function CourseManager() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const queryClient = useQueryClient();

  const courseEvents = useCourseEvents();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Partial<CourseEvent>>({});

  //for date picker
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("12:00");

  function combineDateAndTime(date: Date | undefined, time: string) {
    if (!date) return null;

    const [hours, mins] = time.split(":").map(Number);
    const combo = new Date(date);
    combo.setHours(hours);
    combo.setMinutes(mins);
    combo.setSeconds(0);
    console.log(combo);
    return combo;
  }

  function editRow(row: CourseEvent) {
    setEditingId(row.id);

    const dateTime = row.classStartDatetime
      ? new Date(row.classStartDatetime)
      : undefined;

    setEditDate(dateTime);
    setEditTime(dateTime ? dateTime.toISOString().substring(11, 16) : "12:00");
    setEdits({ ...row });
  }

  function cancelEditing() {
    setEditingId(null);
    setEdits({});
  }

  async function saveEditing() {
    if (!editingId) return;

    const classTime = combineDateAndTime(editDate, editTime);

    await client.courseManagerRouter.updateCourseEvent.mutate({
      id: editingId,
      seats: edits.seats ?? null,
      locationType: edits.locationType!,
      physicalAddress: edits.physicalAddress?.trim() || null,
      //no place to put virtual link atm
      virtualLink: null,
      classStartDatetime: classTime,
    });

    await queryClient.invalidateQueries({
      queryKey: trpc.adminRouter.getCourseEvents.queryKey(),
    });

    cancelEditing();
  }

  async function deleteRow(id: string) {
    await client.courseManagerRouter.deleteCourseEvent.mutate({ id });

    await queryClient.invalidateQueries({
      queryKey: trpc.adminRouter.getCourseEvents.queryKey(),
    });
  }

  const columns: ColumnDef<CourseEvent>[] = [
    { accessorKey: "id", header: "ID" },

    {
      accessorKey: "physicalAddress",
      header: "Address",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <input
            value={edits.physicalAddress ?? ""}
            onChange={(e) =>
              setEdits((prev) => ({
                ...prev,
                physicalAddress: e.target.value,
              }))
            }
            className="border p-1"
          />
        ) : (
          (row.original.physicalAddress ?? "-")
        ),
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
        ) : (
          row.original.locationType
        ),
    },

    {
      accessorKey: "seats",
      header: "Seats",
      cell: ({ row }) =>
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
          />
        ) : (
          (row.original.seats ?? "-")
        ),
    },

    {
      accessorKey: "classStartDatetime",
      header: "Start Date",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <div className="flex flex-col gap-2">
            <Calendar
              mode="single"
              selected={editDate}
              onSelect={setEditDate}
              className="rounded-md border"
            />
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="border p-1"
            />
          </div>
        ) : row.original.classStartDatetime ? (
          new Date(row.original.classStartDatetime).toLocaleString()
        ) : (
          "-"
        ),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;

        return isEditing ? (
          <ButtonGroup>
            <Button variant="secondary" onClick={saveEditing}>
              Save
            </Button>
            <Button variant="secondary" onClick={cancelEditing}>
              Cancel
            </Button>
          </ButtonGroup>
        ) : (
          <ButtonGroup>
            <Button variant="secondary" onClick={() => editRow(row.original)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteRow(row.original.id)}
            >
              Delete
            </Button>
          </ButtonGroup>
        );
      },
    },
  ];

  return (
    <main className="flex flex-wrap items-center justify-center py-4 gap-4">
      <div className="w-full flex justify-center">
        <Card className="min-w-md">
          <CardTitle className="text-center">Upcoming Classes</CardTitle>
          <CardContent>
            <DataTable columns={columns} data={courseEvents.data ?? []} />
          </CardContent>
          <div className="flex justify-end mb-4 pr-4">
            <Button variant="secondary" size="lg">
              + Create New Course Event
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
