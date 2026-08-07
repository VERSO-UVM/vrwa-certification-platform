import type { Course } from "@backend/database/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  reservationDefPresets,
  reservationDefs,
  reservationFieldHelper,
} from "~/utils/field-defs/reservation";
import { useTRPC } from "~/utils/trpc";

const traineeTableDefs = [
  reservationDefs.firstName,
  reservationDefs.lastName,
  reservationDefs.email,
  reservationFieldHelper.accessor("creditHours", {
    header: "Earned TCH",
  }),
];

export default function CertificationsPage() {
  const trpc = useTRPC();
  // TODO: finished courses (all courseEvent in the past)
  const { data: courses = [] } = useQuery(
    trpc.courses.admin.list.queryOptions(),
  );

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: trainees = [] } = useQuery(
    trpc.reservations.admin.listCourse.queryOptions(
      { courseId: selectedCourse?.id! },
      { enabled: Boolean(selectedCourse?.id) },
    ),
  );

  const [emailSubject, setEmailSubject] = useState(
    "Your VRWA Certificate of Completion",
  );
  const [emailBody, setEmailBody] = useState(
    "Please find your certificate of completion attached.",
  );
  const [emailCc, setEmailCc] = useState("");
  const [emailBcc, setEmailBcc] = useState("");

  return (
    <>
      <PageHeader>Certifications</PageHeader>

      {/* Course selection */}

      <div className="grid gap-4 @xl:grid-cols-10">
        <Card className="@xl:col-span-6" variant="blue">
          <CardHeader>
            <CardTitle>Select Trainees</CardTitle>
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

            <DataTable columns={traineeTableDefs} data={trainees} />
          </CardContent>
        </Card>

        <Card className="@xl:col-span-4" variant="green">
          <CardHeader>
            <CardTitle>Email Send-Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 rounded-md">
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
              <Button>{"Send Certificates"}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
