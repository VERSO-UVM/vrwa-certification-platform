import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { CourseEventForm } from "./course-event-form";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";
import type { CourseEvent } from "@backend/database/schema";
import { Plus } from "lucide-react";

export function AddCourseEventButton() {
  const [courseEventDrawerOpen, setCourseEventDrawerOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createMutation = useMutation(
    trpc.courseEvents.admin.create.mutationOptions(),
  );

  return (
    <Drawer
      swipeDirection="right"
      open={courseEventDrawerOpen}
      onOpenChange={setCourseEventDrawerOpen}
    >
      <DrawerTrigger render={<Button variant="secondary" size="lg" />}>
        <Plus /> Add Training Session
      </DrawerTrigger>
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
  );
}
