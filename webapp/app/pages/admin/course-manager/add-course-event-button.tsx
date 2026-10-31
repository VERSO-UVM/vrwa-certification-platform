import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "~/components/ui/drawer";
import { CourseEventForm } from "./course-event-form";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import type { CourseEventDto } from "@backend/database/dtos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC, useTRPCClient } from "~/utils/trpc";
import type { CourseEvent } from "@backend/database/schema";
import { Edit, Plus } from "lucide-react";

export function AddCourseEventButton() {
  const [courseEventDrawerOpen, setCourseEventDrawerOpen] = useState(false);
  const trpc = useTRPC();
  const client = useTRPCClient();
  const queryClient = useQueryClient();
  const updateMutation = useMutation(
    trpc.courseEvents.admin.update.mutationOptions(),
  );
  const createMutation = useMutation(
    trpc.courseEvents.admin.create.mutationOptions(),
  );

  return (
    <>
      <Drawer
        direction="right"
        open={courseEventDrawerOpen}
        onOpenChange={setCourseEventDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Training Session</DrawerTitle>
            <DrawerDescription>
              Make changes to an existing training session
            </DrawerDescription>
          </DrawerHeader>

          <div className="no-scrollbar overflow-y-auto px-4">
            <CourseEventForm
              event={null}
              onCreate={async (data) => {
                await createMutation.mutate(data as CourseEvent);
                await queryClient.invalidateQueries({
                  queryKey: trpc.courseEvents.admin.list.queryKey(),
                });
                setCourseEventDrawerOpen(false);
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => {
          setCourseEventDrawerOpen(true);
        }}
      >
        <Plus /> Add Training Session
      </Button>
    </>
  );
}
