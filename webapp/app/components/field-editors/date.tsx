import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { FieldEditor, FieldEditorProps } from "~/utils/field-editors";
import { isValidDate } from "~/utils/utils";
import { Field, FieldGroup } from "../ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "../ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";

export function dateEditor(): FieldEditor<unknown, Date | null> {
  return DatetimeEditor;
}

/**
 * Date and time picker.
 * Adapted from shadcn/ui example.
 */
export function DatetimeEditor({
  value: date,
  onChange,
  onBlur,
  overrides,
}: FieldEditorProps<unknown, Date | null>) {
  date ??= new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(date);
  const [dateString, setDateString] = useState(formatDate(date));
  const [timeString, setTimeString] = useState(formatTimeForInput(date));

  return (
    <FieldGroup className="mx-auto flex-row">
      <Field>
        <InputGroup>
          <InputGroupInput
            {...overrides}
            value={dateString}
            placeholder="June 01, 2025"
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              newDate.setHours(date.getHours());
              newDate.setMinutes(date.getMinutes());

              setDateString(e.target.value);
              if (isValidDate(newDate)) {
                setMonth(newDate);
                onChange(newDate);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            onBlur={() => onBlur(date)}
          />
          <InputGroupAddon align="inline-end">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                >
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
                alignOffset={-8}
                sideOffset={10}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  month={month}
                  onMonthChange={setMonth}
                  onSelect={(date) => {
                    setOpen(false);
                    if (date) {
                      setDateString(formatDate(date));
                      onChange(date);
                      onBlur(date);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field>
        <Input
          aria-label="time"
          type="time"
          step="60"
          value={timeString}
          className=""
          onChange={(event) => {
            const timeString = event.target.value; // Expected format: "HH:mm"
            if (!timeString) return;

            const [hours, minutes] = timeString.split(":").map(Number);
            if (hours == null || minutes == null) return;

            // Create a new Date instance based on the current state to preserve the day/month/year
            const updatedDate = new Date(date);
            updatedDate.setHours(hours);
            updatedDate.setMinutes(minutes);
            updatedDate.setSeconds(0);
            updatedDate.setMilliseconds(0);

            setTimeString(event.target.value);
            onChange(updatedDate);
          }}
          onBlur={() => onBlur(date)}
        />
      </Field>
    </FieldGroup>
  );
}

export function TimeInput({
  value: date,
  onChange,
  onBlur,
  overrides,
}: FieldEditorProps<unknown, Date | null>) {
  const [timeString, setTimeString] = useState(formatTimeForInput(date));
  return (
    <Input
      type="time"
      step="60"
      value={timeString}
      onChange={(event) => {
        const timeString = event.target.value; // Expected format: "HH:mm"
        if (!timeString) return;

        const [hours, minutes] = timeString.split(":").map(Number);
        if (hours == null || minutes == null) return;
        setTimeString(event.target.value);

        const updatedDate = date ? new Date(date) : new Date();
        updatedDate.setHours(hours);
        updatedDate.setMinutes(minutes);
        updatedDate.setSeconds(0);
        updatedDate.setMilliseconds(0);
        onChange(updatedDate);
      }}
      onBlur={() => {
        onBlur(date);
      }}
      {...overrides}
    />
  );
}

function formatTimeForInput(date: Date | null | undefined): string {
  if (!date) return "00:00";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
