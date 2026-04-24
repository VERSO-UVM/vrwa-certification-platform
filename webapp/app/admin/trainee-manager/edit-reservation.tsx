import type { ReservationDto } from "@backend/database/dtos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "~/components/entry-views/edit-drawer";
import { reservationDefPresets } from "~/utils/field-defs/reservation";
import { useTRPC } from "~/utils/trpc";

export function EditTraineeReservation({
  reservation,
}: {
  reservation: ReservationDto;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const reservationUpdater = useMutation(
    trpc.reservation.update.mutationOptions(),
  );

  const updateData = async (updates: Partial<ReservationDto>) => {
    await reservationUpdater.mutateAsync({
      profileId: reservation.profileId,
      courseEventId: reservation.courseEventId,
      creditHours: updates.creditHours?.toString(),
      paymentStatus: updates.paymentStatus,
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.adminRouter.getTraineeReservations.queryKey(),
    });
  };

  return (
    <EditDrawer
      drawer={{
        buttonText: "Edit",
        title: `${reservation.firstName} - ${reservation.lastName} ${reservation.course.courseName}`,
        description: "Update credit hours and payment status",
      }}
      item={reservation}
      columns={reservationDefPresets.basic}
      onSave={updateData}
    />
  );
}
