import React from "react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { RowSelectionState } from "@tanstack/react-table";
import type { ReservationDto } from "@backend/database/dtos";
import type { Course } from "@backend/database/schema";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  reservationDefs,
  reservationFieldHelper,
} from "~/utils/field-defs/reservation";
import { useTRPC } from "~/utils/trpc";
import { profileFullName } from "~/utils/utils";
import { checkboxSelectorColumn } from "~/utils/field-defs/extra";

const traineeTableDefs = [
  checkboxSelectorColumn<ReservationDto>(),
  reservationDefs.firstName,
  reservationDefs.lastName,
  reservationDefs.email,
  reservationFieldHelper.accessor("creditHours", {
    header: "Earned TCH",
  }),
];

export default function CertificationsPage() {
  const trpc = useTRPC();
  // TODO: show only finished courses (all courseEvent in the past)
  const { data: courses = [] } = useQuery(
    trpc.courses.admin.list.queryOptions(),
  );

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: trainees = [] } = useQuery(
    trpc.reservations.admin.listCourse.queryOptions(
      { courseId: selectedCourse?.id! },
      {
        enabled: Boolean(selectedCourse?.id),
        select: (reservations) =>
          reservations.filter((item) => item.creditHours !== "0"),
      },
    ),
  );

  const batchEmailMutation = useMutation(
    trpc.certificates.admin.batchEmail.mutationOptions(),
  );

  /* Needed for multi-select Combobox */
  const recipientsAnchor = useComboboxAnchor();

  /* The actual recipients we are sending to */
  const [recipients, setRecipients] = useState<ReservationDto[]>([]);

  const [emailSubject, setEmailSubject] = useState(
    "Your VRWA Certificate of Completion",
  );
  const [emailBody, setEmailBody] = useState(
    "Please find your certificate of completion attached.",
  );
  const [emailCc, setEmailCc] = useState("");
  const [emailBcc, setEmailBcc] = useState("");

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const addSelectedRecipients = () => {
    const newRecipients = [];
    for (const [index, isSelected] of Object.entries(rowSelection)) {
      const i = parseInt(index);
      if (
        isSelected &&
        trainees[i] &&
        !recipients.find(
          (item) =>
            item.profileId == trainees[i]?.profileId ||
            item.courseId == trainees[i]?.courseId,
        )
      ) {
        newRecipients.push(trainees[i]);
      }
    }
    setRecipients([...recipients, ...newRecipients]);
    setRowSelection({}); /* Reset row selection */
  };

  const addAllRecipients = () => {
    setRecipients([
      ...recipients.filter((rec) => rec.course.id !== selectedCourse?.id),
      ...trainees,
    ]);
    setRowSelection({}); /* Reset row selection */
  };

  const sendCertificates = () => {
    batchEmailMutation.mutate(
      recipients.map(({ profileId, courseId }) => ({
        profileId,
        courseId,
      })),
      {
        onSuccess: () => {
          setRecipients([]);
          setSelectedCourse(null);
        },
      },
    );
  };

  return (
    <>
      <PageHeader>Certifications</PageHeader>

      {/* Course selection */}

      <div className="grid gap-4 @xl:grid-cols-10">
        <Card className="@xl:col-span-6" variant="blue">
          <CardHeader>
            <CardTitle>Select Trainees</CardTitle>
            <CardDescription>
              First, search for a course. Then, select trainees to send certificates to or choose Add All.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="course-selection">Course</Label>
            <Combobox
              value={selectedCourse}
              onValueChange={setSelectedCourse}
              id="course-selection"
              items={courses}
              itemToStringLabel={(course: Course) => course.courseName}
              itemToStringValue={(course: Course) => course.courseName}
              autoHighlight
            >
              <ComboboxInput placeholder="Select a course" />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>

                <ComboboxList>
                  {(item: Course) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.courseName}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {/* Trainee selection */}

          {selectedCourse && (<>
            <DataTable
              columns={traineeTableDefs}
              data={trainees}
              table={{
                enableMultiRowSelection: true,
                initialState: {
                  pagination: {
                    pageSize: 10,
                  },
                },
                onRowSelectionChange: (updater) => {
                  setRowSelection((prev) =>
                    typeof updater === "function" ? updater(prev) : updater,
                  );
                },
                state: { rowSelection },
              }}
            />

            <div className="flex justify-between">
              <Button
                disabled={Object.entries(rowSelection).length == 0}
                onClick={() => addSelectedRecipients()}
              >
                Add Selected ({Object.entries(rowSelection).length})
              </Button>
              <Button
                disabled={trainees.length == 0}
                onClick={() => addAllRecipients()}
              >
                Add All ({trainees.length})
              </Button>
            </div>
          </>
            )}
          </CardContent>
        </Card>

        <Card className="@xl:col-span-4" variant="green">
          <CardHeader>
            <CardTitle>Batch Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 rounded-md">
              <Label className="mb-2" htmlFor="recipient-list">
                Trainees
              </Label>
              <Combobox
                multiple /* Support multiple recipients */
                autoHighlight /* Use enter to select after typing in value */
                items={trainees}
                itemToStringLabel={profileFullName}
                itemToStringValue={profileFullName}
                value={recipients}
                onValueChange={setRecipients}
                id="recipient-list"
              >
                <ComboboxChips
                  ref={recipientsAnchor}
                  className="w-full max-w-xs"
                >
                  <ComboboxValue>
                    {(values: ReservationDto[]) => (
                      <React.Fragment>
                        {values.map((item) => (
                          <ComboboxChip
                            key={item.profileId + item.courseId}
                          >
                            {profileFullName(item)}
                          </ComboboxChip>
                        ))}
                        <ComboboxChipsInput />
                      </React.Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={recipientsAnchor}>
                  <ComboboxEmpty>
                    Select a course to search for trainees.
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item: ReservationDto) => (
                      <ComboboxItem
                        key={item.profileId + item.courseId}
                        value={item}
                      >
                        {profileFullName(item)}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <Button variant="edit" onClick={() => setRecipients([])}>
                Clear all
              </Button>

              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CC (optional)</Label>
                <Input
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>BCC (optional)</Label>
                <Input
                  value={emailBcc}
                  onChange={(e) => setEmailBcc(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                />
              </div>
              <Button
                onClick={() => sendCertificates()}
                disabled={recipients.length == 0}
              >
                Send Certificates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
