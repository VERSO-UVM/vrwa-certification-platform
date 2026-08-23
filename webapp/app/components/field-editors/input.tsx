import type { FieldEditor, HasToString } from "~/utils/field-editors";
import { Input } from "~/components/ui/input";
import { useState } from "react";

/**
 * For regular short string text inputs.
 * @see textAreaEditor
 * @see intInputEditor
 */
export function stringInputEditor(
  props?: React.ComponentProps<typeof Input>,
): FieldEditor<unknown, string> {
  const NullableTextInput = genericInputEditor((x) => x, props);
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
): FieldEditor<T, number | undefined> {
  const NumberInput = genericInputEditor<number>(parseInt, {
    type: "number",
    ...props,
  });
  return ({ onChange, onBlur, value, ...rest }) => {
    return (
      <NumberInput
        {...rest}
        value={value ?? NaN}
        onChange={(val) => onChange(val ?? 0)}
        onBlur={(val) => onBlur(val ?? 0)}
      />
    );
  };
}

/**
 * Generic input editor.
 */
export function genericInputEditor<U extends HasToString>(
  parse: (x: string) => U,
  props?: React.ComponentProps<typeof Input>,
): FieldEditor<unknown, U | null> {
  return ({ overrides, onChange, onBlur, value: orig }) => {
    const [value, setValue] = useState(orig);
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
 * Specialized editor to make sure there is no funny business
 * with price amounts.
 */
export function priceCentsEditor(
  props?: React.ComponentProps<typeof Input>,
): FieldEditor<unknown, number> {
  const toDisplay = (cents: number) => (cents / 100).toFixed(2).toString();
  const toCents = (s: string) => Math.round(parseFloat(s) * 100);

  return ({ overrides, onChange, onBlur, value }) => {
    const [display, setDisplay] = useState(value ? toDisplay(value) : "");

    return (
      <Input
        value={display}
        disabled={value == null}
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
