/**
 * Customizable generic editors to use in the meta.editor ColumnDef
 * property.
 * The idea is for these functions to be highly re-usable and we don't need many.
 *
 * Currently still missing:
 *
 * - [ ] Checkbox
 * - [ ] Radio
 * - [ ] Date input
 */

import type { CellContext } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";

/**
 * I didn't see a built-in interface for props for generic form fields that exist
 * in <input>, <select>, etc. This can be updated with any of those.
 */
export interface FormFieldProps {
  id: string; /* To match <label> `for` attribute */
  required: boolean;
}

export type FieldEditor<TData, TValue> = (item: {
  /**
   * `ctx` is the same as the object pass to table `cell` ColumnDef funciton.
   */
  ctx: CellContext<TData, TValue>;

  overrides: Partial<FormFieldProps>;

  onChange: (value: TValue) => void;

  /**
   * Use onBlur for things like querying or updating the
   * database or validating or sending messages to the user.
   * I loathe when apps show me error messages before I've finished
   * typing.
   */
  onBlur: (value: TValue) => void;
}) => React.ReactNode;

/**
 * Can override `props` for, e.g. type="number".
 */
export function textInputEditor<T>(
  props?: React.ComponentProps<typeof Input>,
): FieldEditor<T, string> {
  return ({ overrides, onChange, onBlur, ctx: { getValue } }) => {
    const [value, setValue] = useState(getValue());
    // if the value's been taken out from under us
    useEffect(() => setValue(getValue()), [getValue()]);
    return (
      <Input
        value={value}
        type="text"
        onChange={(event) => {
          setValue(event.target.value);
          onChange(event.target.value);
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

export function selectOptionsEditor<T, U extends { toString: () => string }>({
  options,
  props,
}: {
  options: { label: string; value: U; selected?: boolean }[];
  props?: React.ComponentProps<typeof NativeSelect>;
}): FieldEditor<T, U> {
  // Native <select> requires string values, but we want this function to be generic
  const stringToValue = Object.fromEntries(
    options.map(({ value }) => [value.toString(), value]),
  );
  return ({ overrides, onChange, onBlur, ctx: { getValue } }) => {
    const [value, _setValue] = useState(getValue());
    // if the value's been taken out from under us
    useEffect(() => _setValue(getValue()), [getValue()]);
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
          <NativeSelectOption value={value.toString()} key={value.toString()} {...rest}>
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  };
}
