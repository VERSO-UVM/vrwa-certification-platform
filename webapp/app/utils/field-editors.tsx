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

export type FieldEditor<TData, TValue> = (item: {
  /**
   * `ctx` is the same as the object pass to table `cell` ColumnDef funciton.
   */
  ctx: CellContext<TData, TValue>;

  forId: string;

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
  props?: React.ComponentProps<"input">,
): FieldEditor<T, string> {
  return ({ forId, onChange, onBlur, ctx: { getValue } }) => {
    const [value, setValue] = useState(getValue());
    // if the value's been taken out from under us
    useEffect(() => setValue(getValue()), [getValue()]);
    return (
      <Input
        id={forId}
        value={value}
        type="text"
        onChange={(event) => {
          setValue(event.target.value);
          onChange(event.target.value);
        }}
        onBlur={() => onBlur(value)}
        {...props}
      />
    );
  };
}

export function selectOptionsEditor<T, U extends { toString: () => string }>({
  options,
}: {
  options: { label: string; value: U }[];
}): FieldEditor<T, U> {
  // Native <select> requires string values, but we want this function to be generic
  const stringToValue = Object.fromEntries(
    options.map(({ value }) => [value.toString(), value]),
  );
  return ({ forId, onChange, onBlur, ctx: { getValue } }) => {
    const [value, _setValue] = useState(getValue());
    // if the value's been taken out from under us
    useEffect(() => _setValue(getValue()), [getValue()]);
    const setValue = (value: U) => {
      _setValue(value);
      onChange(value);
    };
    return (
      <NativeSelect
        id={forId}
        onBlur={() => onBlur(value)}
        value={value.toString()}
        onChange={(event) =>
          setValue(stringToValue[event.target.value] ?? value)
        }
      >
        {options.map(({ label, value }) => (
          <NativeSelectOption value={value.toString()} key={value.toString()}>
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  };
}
