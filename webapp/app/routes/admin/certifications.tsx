import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useTRPC } from "~/utils/trpc";
import { useHashString } from "~/hooks/use-hash-string";
import { PageHeader } from "~/components/page-header";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type Recipient = {
  profileId: string;
  courseEventId: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

type RecipientKey = `${string}:${string}`;

function parseRecipientHash(value: string | null): RecipientKey[] {
  if (!value) return [];
  return value
    .split("+")
    .filter(Boolean)
    .filter((x): x is RecipientKey => x.includes(":"));
}

function serializeRecipientHash(entries: RecipientKey[]) {
  return entries.join("+");
}

export default function AdminCertificationsPage() {
  const trpc = useTRPC();
  const [hashValue, setHashValue] = useHashString(null);
  const [selectedCourseEventId, setSelectedCourseEventId] = useState<
    string | null
  >(null);
  const [emailSubject, setEmailSubject] = useState(
    "Your VRWA Certificate of Completion",
  );
  const [emailBody, setEmailBody] = useState(
    "Please find your certificate of completion attached.",
  );
  const [emailCc, setEmailCc] = useState("");
  const [emailBcc, setEmailBcc] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const recipientKeys = useMemo(
    () => parseRecipientHash(hashValue),
    [hashValue],
  );
  const recipientSet = useMemo(() => new Set(recipientKeys), [recipientKeys]);

  const courseEventsQuery = useQuery(
    trpc.adminRouter.getCourseEvents.queryOptions(undefined, {
      select: (rows) =>
        rows.filter((row) => row.classStartDatetime && new Date() > new Date()),
    }),
  );

  const eligibleRecipientsQuery = useQuery(
    trpc.certificateRouter.listEligibleRecipients.queryOptions(
      { courseEventId: selectedCourseEventId ?? "" },
      { enabled: Boolean(selectedCourseEventId) },
    ),
  );

  const recipientMap = useMemo(() => {
    const map = new Map<RecipientKey, Recipient>();
    for (const row of eligibleRecipientsQuery.data ?? []) {
      const key = `${row.profileId}:${row.courseEventId}` as RecipientKey;
      map.set(key, row);
    }
    return map;
  }, [eligibleRecipientsQuery.data]);

  const selectedRecipients = useMemo(() => {
    return recipientKeys.map((key) => ({
      key,
      recipient: recipientMap.get(key) ?? null,
    }));
  }, [recipientKeys, recipientMap]);

  const sendMutation = useMutation(
    trpc.certificateRouter.bulkSendCertificates.mutationOptions({
      onSuccess: (result) => {
        if (result.errors.length > 0) {
          toast.warning(
            `Sent ${result.sent} certificate emails with ${result.errors.length} errors.`,
          );
        } else {
          toast.success(`Sent ${result.sent} certificate emails.`);
        }
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const columns = useMemo<ColumnDef<Recipient>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
    ],
    [],
  );

  const addSelectedRecipients = () => {
    const rows = eligibleRecipientsQuery.data ?? [];
    const chosenKeys = Object.keys(rowSelection).filter(
      (key) => rowSelection[key],
    );
    if (chosenKeys.length === 0) {
      toast.error("Select at least one trainee to add.");
      return;
    }
    const next = new Set(recipientKeys);
    for (const rowKey of chosenKeys) {
      const row = rows[parseInt(rowKey, 10)];
      if (!row) continue;
      next.add(`${row.profileId}:${row.courseEventId}` as RecipientKey);
    }
    setHashValue(serializeRecipientHash(Array.from(next)));
    setRowSelection({});
  };

  const removeRecipient = (key: RecipientKey) => {
    const next = recipientKeys.filter((entry) => entry !== key);
    setHashValue(next.length > 0 ? serializeRecipientHash(next) : null);
  };

  const clearRecipients = () => setHashValue(null);

  const sendCertificates = async () => {
    if (recipientKeys.length === 0) {
      toast.error("Add at least one trainee to recipients.");
      return;
    }
    await sendMutation.mutateAsync({
      recipients: recipientKeys
        .map((entry) => {
          const [profileId, courseEventId] = entry.split(":");
          if (!profileId || !courseEventId) return null;
          return { profileId, courseEventId };
        })
        .filter(
          (entry): entry is { profileId: string; courseEventId: string } =>
            Boolean(entry),
        ),
      emailSubject,
      emailBody,
      cc: emailCc || undefined,
      bcc: emailBcc || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader>Certifications</PageHeader>
      <div className="grid gap-4 @xl:grid-cols-10">
        <Card className="@xl:col-span-6">
          <CardHeader>
            <CardTitle>Select Trainees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Course Session</Label>
              <Select
                value={selectedCourseEventId ?? ""}
                onValueChange={(value) => setSelectedCourseEventId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class session" />
                </SelectTrigger>
                <SelectContent>
                  {(courseEventsQuery.data ?? []).map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DataTable
              columns={columns}
              data={(eligibleRecipientsQuery.data ?? []) as Recipient[]}
              table={{
                onRowSelectionChange: (updater) => {
                  setRowSelection((prev) =>
                    typeof updater === "function" ? updater(prev) : updater,
                  );
                },
                state: { rowSelection },
              }}
            />
            <Button onClick={addSelectedRecipients}>Add Selected</Button>
          </CardContent>
        </Card>
        <Card className="@xl:col-span-4">
          <CardHeader>
            <CardTitle>Email Certificates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Recipients</div>
              <div className="space-y-2 rounded-md border p-2 max-h-52 overflow-auto">
                {selectedRecipients.length > 0 ? (
                  selectedRecipients.map(({ key, recipient }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-sm border p-2 text-sm"
                    >
                      <div>
                        {recipient
                          ? `${recipient.firstName} ${recipient.lastName} (${recipient.email ?? "no email"})`
                          : key}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRecipient(key)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No recipients selected.
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={clearRecipients}>
                Clear All
              </Button>
            </div>
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
              onClick={sendCertificates}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? "Sending..." : "Send Certificates"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
