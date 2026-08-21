import { useState, useEffect } from "react";
import type { FieldEditor, HasToString } from "~/utils/field-editors";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";

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
    const [value, setValue] = useState(orig);
    return (
      <NativeSelect
        onBlur={() => onBlur(value)}
        value={value?.toString()}
        onChange={(event) => {
          const newVal = stringToValue[event.target.value];
          if (newVal) {
            setValue(newVal);
            onChange(newVal);
          }
        }}
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
