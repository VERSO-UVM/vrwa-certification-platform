import type { CellContext } from "@tanstack/react-table";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";

export type ColumnEditor<TData, TValue> = (item: {
  ctx: CellContext<TData, TValue>;
  forId: string;
  onUpdate: (value: TValue) => void;
}) => React.ReactNode;

export function textInputEditor<T>(): ColumnEditor<T, string> {
  return ({ forId, onUpdate, ctx: { getValue } }) => {
    const [value, setValue] = useState(getValue());
    return (
      <Input
        id={forId}
        value={value}
        type="text"
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => onUpdate(value)}
      />
    );
  };
}

export function selectOptionsEditor<T, U extends { toString: () => string }>({
  options,
}: {
  options: { label: string; value: U }[];
}): ColumnEditor<T, U> {
  // Native <select> requires string values, but we want this function to be generic
  const stringToValue = Object.fromEntries(
    options.map(({ value }) => [value.toString(), value]),
  );
  return ({ forId, onUpdate, ctx: { getValue } }) => {
    const [value, setValue] = useState(getValue());
    return (
      <NativeSelect
        id={forId}
        onBlur={() => onUpdate(value)}
        onChange={(event) =>
          setValue(stringToValue[event.target.value] ?? value)
        }
      >
        {options.map(({ label, value }) => (
          <NativeSelectOption value={value.toString()}>
            {label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    );
  };
}
