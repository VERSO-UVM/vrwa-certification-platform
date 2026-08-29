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
import { format, set } from "date-fns";

export function dateEditor(): FieldEditor<unknown, Date | null> {
  return DatetimeEditor;
}

/**
 * Date and time picker.
 * Adapted from shadcn/ui example.
 */
export function DatetimeEditor({
  value: orig,
  onChange,
  onBlur,
  overrides,
  ...rest
}: FieldEditorProps<unknown, Date | null>) {
  const [date, setDate] = useState(orig ?? new Date());
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(date);
  const [dateString, setDateString] = useState(formatDate(date));

  return (
    <FieldGroup className="mx-auto flex-row">
      <Field>
        <InputGroup>
          <InputGroupInput
            {...overrides}
            value={dateString}
            placeholder="June 01, 2025"
            onChange={(e) => {
              const newDate = set(new Date(e.target.value), {
                hours: date.getHours(),
                minutes: date.getMinutes(),
              });

              setDateString(e.target.value);
              if (isValidDate(newDate)) {
                setMonth(newDate);
                onChange(newDate);
                setDate(newDate);
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
                      setDate(date);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field>
        <TimeInput
          value={date}
          onChange={onChange}
          onBlur={() => onBlur(date)}
          overrides={overrides}
          {...rest}
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

        const updatedDate = set(date ?? new Date(), {
          hours,
          minutes,
          seconds: 0,
          milliseconds: 0,
        });
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
  return format(date, "hh:mm");
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
