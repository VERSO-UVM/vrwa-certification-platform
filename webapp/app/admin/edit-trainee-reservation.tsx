import type { ReservationDto } from "@backend/database/dtos";
import type { PaymentStatus } from "@backend/database/schema";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import { useTRPC, useTRPCClient } from "~/utils/trpc";

export function EditTraineeReservation({
  reservation,
}: {
  reservation: ReservationDto;
}) {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const queryClient = useQueryClient();

  const initialValue = {
    creditHours: parseFloat(reservation.creditHours),
    paymentStatus: reservation.paymentStatus,
  };
  const [state, setState] = useState(initialValue);
  useEffect(
    () => setState(initialValue),
    [reservation.courseEventId, reservation.profileId],
  );

  const updateData = async () => {
    await client.reservationRouter.update.mutate({
      profileId: reservation.profileId,
      courseEventId: reservation.courseEventId,
      creditHours: state.creditHours.toString(),
      paymentStatus: state.paymentStatus,
    });
    console.log(`invalidating queries for ${trpc.adminRouter.getTraineeReservations.queryKey()}`);
    await queryClient.invalidateQueries({
      queryKey: trpc.adminRouter.getTraineeReservations.queryKey(),
    });
  };

  return (
    <>
      <h3 className="text-lg font-medium py-3">
        {reservation.firstName} - {reservation.lastName} {reservation.course.courseName}
      </h3>
      <FieldSet className="pb-2">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="creditHours">Credit Hours Received</FieldLabel>
            <Input
              id="creditHours"
              className="max-w-30"
              type="number"
              autoComplete="off"
              value={state.creditHours}
              step={0.1}
              onChange={(event) =>
                setState({
                  ...state,
                  creditHours: parseFloat(event.target.value),
                })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="paymentStatus">Payment Status</FieldLabel>
            <NativeSelect
              id="paymentStatus"
              className="max-w-60"
              value={state.paymentStatus}
              onChange={(event) =>
                setState({
                  ...state,
                  paymentStatus: event.target.value as PaymentStatus,
                })
              }
            >
              <NativeSelectOption value="paid">Paid</NativeSelectOption>
              <NativeSelectOption value="unpaid">Unpaid</NativeSelectOption>
            </NativeSelect>
          </Field>
        </FieldGroup>
        <Button onClick={() => updateData()}>Save changes</Button>
      </FieldSet>
    </>
  );
}
