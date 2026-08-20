/**
 * Customizable generic editors to use in the meta.editor ColumnDef
 * property. The idea is for these functions to be highly re-usable. They
 * have no direct dependencies on any React-Table things, so they may be
 * used in other contexts.
 *
 * Currently still missing:
 *
 * - [ ] Checkbox
 * - [ ] Radio
 * - [x] Date input
 */

import { useEffect, useState } from "react";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Field, FieldGroup } from "~/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group";
import { isValidDate } from "./utils";
import { Textarea } from "~/components/ui/textarea";

/**
 * I didn't see a built-in interface for props for generic form fields that exist
 * in <input>, <select>, etc. This can be updated with any of those.
 */
export interface FormFieldProps {
  id: string; /* To match <label> `for` attribute */
  required: boolean;
}

export interface FieldEditorProps<TData, TValue> {
  /**
   * Get current value of the field.
   */
  value: TValue;

  /**
   * If an editor does not need to see other values, use
   * FieldEditor<unknown, TValue>.
   */
  getRow: () => TData;

  overrides: Partial<FormFieldProps>;

  onChange: (value: TValue) => void;

  /**
   * Use onBlur for things like querying or updating the
   * database or validating or sending messages to the user.
   * I loathe when apps show me error messages before I've finished
   * typing.
   */
  onBlur: (value: TValue) => void;
}

export type FieldEditor<TData, TValue> = (
  item: FieldEditorProps<TData, TValue>,
) => React.ReactNode;

interface HasToString {
  toString(): string;
}

/**
 * refactor: rename to stringInputEditor
 */
export function textInputEditor(
  props?: React.ComponentProps<typeof Input>,
): FieldEditor<unknown, string> {
  const NullableTextInput = _genericInputEditor((x) => x, props);
  return ({ onChange, onBlur, ...rest }) => (
    <NullableTextInput
      onChange={(x) => onChange(x ?? "")}
      onBlur={(x) => onBlur(x ?? "")}
      {...rest}
    />
  );
}

export function intInputEditor<T>(
  props?: React.ComponentProps<typeof Input>,
): FieldEditor<T, number> {
  const NumberInput = _genericInputEditor<number>(parseInt, {
    type: "number",
    ...props,
  });
  return ({ onChange, onBlur, ...rest }) => {
    return (
      <NumberInput
        {...rest}
        onChange={(val) => onChange(val ?? 0)}
        onBlur={(val) => onBlur(val ?? 0)}
      />
    );
  };
}

/**
 * Generic input editor.
 */
export function _genericInputEditor<U extends HasToString>(
  parse: (x: string) => U,
  props?: React.ComponentProps<typeof Input>,
): FieldEditor<unknown, U | null> {
  return ({ overrides, onChange, onBlur, value: orig }) => {
    const [value, setValue] = useState(orig);
    // if the value's been taken out from under us
    useEffect(() => setValue(orig), [orig]);
    return (
      <Input
        value={value?.toString() ?? ""}
        type="text" /* Can be overriden with props */
        className="user-invalid:border-pink-500 focus:user-invalid:ring-pink-400"
        onChange={(event) => {
          const val = parse(event.target.value);
          setValue(val);
          onChange(val);
        }}
        onBlur={() => onBlur(value)}
        // Default to required, can be overriden
        required
        {...props}
        {...overrides}
      />
    );
  };
}

/**
 * Generic input editor.
 */
export function textAreaEditor(
  props?: React.ComponentProps<typeof Textarea>,
): FieldEditor<unknown, string> {
  return ({ overrides, onChange, onBlur, value: orig }) => {
    const [value, setValue] = useState(orig);
    // if the value's been taken out from under us
    useEffect(() => setValue(orig), [orig]);
    return (
      <Textarea
        value={value?.toString() ?? ""}
        onChange={(event) => {
          const val = event.target.value;
          setValue(val);
          onChange(val);
        }}
        onBlur={() => onBlur(value)}
        // Default to required, can be overriden
        required
        {...props}
        {...overrides}
      />
    );
  };
}

/**
 * Specialized editor to make sure there is no funny business
 * with price amounts.
 */
export function priceCentsEditor(
  props?: React.ComponentProps<typeof Input>,
): FieldEditor<unknown, number> {
  const toDisplay = (cents: number) => (cents / 100).toFixed(2).toString();
  const toCents = (s: string) => Math.round(parseFloat(s) * 100);

  return ({ overrides, onChange, onBlur, value }) => {
    const [display, setDisplay] = useState(toDisplay(value));
    // if the value's been taken out from under us
    useEffect(() => setDisplay(toDisplay(value)), [value]);

    return (
      <Input
        value={display ?? ""}
        type="number"
        className="user-invalid:border-pink-500 focus:user-invalid:ring-pink-400"
        onChange={(event) => {
          setDisplay(event.target.value);
          const val = toCents(event.target.value);
          // Only set when it is actually valid
          if (!isNaN(val)) {
            onChange(val);
          }
        }}
        onBlur={() => {
          const cents = toCents(display);
          if (!isNaN(cents)) {
            // Blur: change input to show actual value
            setDisplay(toDisplay(cents));
          }
          onBlur(cents);
        }}
        // Default to required, can be overriden
        required
        step={0.01}
        {...props}
        {...overrides}
      />
    );
  };
}

/**
 * Highly extensible select options.
 */
export function selectOptionsEditor<U extends HasToString>({
  options,
  props,
}: {
  options: { label: string; value: U; selected?: boolean }[];
  props?: React.ComponentProps<typeof NativeSelect>;
}): FieldEditor<unknown, U> {
  // Native <select> requires string values, but we want this function to be generic
  const stringToValue = Object.fromEntries(
    options.map(({ value }) => [value.toString(), value]),
  );
  return ({ overrides, onChange, onBlur, value: orig }) => {
    const [value, _setValue] = useState(orig);
    // if the value's been taken out from under us
    useEffect(() => _setValue(orig), [orig]);
    const setValue = (value: U) => {
      _setValue(value);
      onChange(value);
    };
    return (
      <NativeSelect
        onBlur={() => onBlur(value)}
        value={value?.toString()}
        onChange={(event) =>
          setValue(stringToValue[event.target.value] ?? value)
        }
        {...props}
        {...overrides}
      >
        {options.map(({ label, value, ...rest }) => (
          <NativeSelectOption
            value={value.toString()}
            key={value.toString()}
            {...rest}
          >
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  };
}

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
  // If value is taken out from under us
  useEffect(() => {
    setMonth(date);
    setDateString(formatDate(date));
    setTimeString(formatTimeForInput(date));
  }, [date]);

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
  // if the value's been taken out from under us
  useEffect(() => {
    if (date) setTimeString(formatTimeForInput(date));
  }, [date]);

  return (
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
    </Field>
  );
}

const formatTimeForInput = (date: Date | null): string => {
  if (!date) return "00:00";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

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
