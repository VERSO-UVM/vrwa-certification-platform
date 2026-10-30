/**
 * Date input fields. These are adapted from the shadcn/ui examples.
 * The actual components they give us require a lot of infrastracture, as usual.
 */
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
import { format, isValid, set } from "date-fns";

export function dateEditor(): FieldEditor<unknown, Date | null> {
  return DatetimeEditor;
}

/**
 * Date and time picker.
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
  const [dateString, setDateString] = useState(dateToDateString(date));

  return (
    <FieldGroup className="flex flex-row gap-4">
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
              <PopoverTrigger
                render={
                  <InputGroupButton
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Select date"
                  />
                }
              >
                <CalendarIcon />
                <span className="sr-only">Select date</span>
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
                  onSelect={(selected) => {
                    setOpen(false);
                    if (selected) {
                      const withTime = set(selected, {
                        hours: date.getHours(),
                        minutes: date.getMinutes(),
                      });
                      setDateString(dateToDateString(withTime));
                      onChange(withTime);
                      onBlur(withTime);
                      setDate(withTime);
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
          onChange={(newDate) => {
            if (newDate) {
              setDate(newDate);
              onChange(newDate);
            }
          }}
          onBlur={() => onBlur(date)}
          overrides={overrides}
          {...rest}
        />
      </Field>
    </FieldGroup>
  );
}

/**
 * Time picker.
 */
export function TimeInput({
  value: date,
  onChange,
  onBlur,
  overrides,
}: FieldEditorProps<unknown, Date | null>) {
  const [timeString, setTimeString] = useState(dateToTimeString(date));

  /* Change the time, keep the day */
  const updateDate = (timeString: string) => {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(":").map(Number);
    if (hours == null || minutes == null) return null;
    setTimeString(timeString);

    return set(date ?? new Date(), {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });
  };
  return (
    <Input
      type="time"
      step="60" // By the minute, not the second
      value={timeString}
      onChange={(event) => {
        const newDate = updateDate(event.target.value);
        if (newDate) onChange(newDate);
      }}
      onBlur={(event) => {
        const newDate = updateDate(event.target.value);
        if (newDate) onBlur(newDate);
      }}
      {...overrides}
    />
  );
}

/* Get the input[type="time"] string equivalent for a given date */
function dateToTimeString(date: Date | null | undefined): string {
  if (!date) return "00:00";
  if (!isValid(date)) return "00:00";
  return format(date, "HH:mm");
}

/* Get the human string representation of day/month/year */
function dateToDateString(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
