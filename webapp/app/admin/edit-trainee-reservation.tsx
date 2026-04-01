import type { ReservationDto } from "@backend/database/dtos";
import type { PaymentStatus } from "@backend/database/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { EditForm } from "~/components/edit-form";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import {
  reservationColumnDefLists,
} from "~/utils/column-defs/reservation";
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
    console.log(
      `invalidating queries for ${trpc.adminRouter.getTraineeReservations.queryKey()}`,
    );
    await queryClient.invalidateQueries({
      queryKey: trpc.adminRouter.getTraineeReservations.queryKey(),
    });
  };

  return (
    <>
      <h3 className="text-lg font-medium py-3">
        {reservation.firstName} - {reservation.lastName}{" "}
        {reservation.course.courseName}
      </h3>
      <EditForm
        item={reservation}
        columns={reservationColumnDefLists.basic}
        onSave={updateData}
      />
    </>
  );
}
