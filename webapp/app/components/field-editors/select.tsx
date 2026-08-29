import { useState } from "react";
import type { FieldEditor, HasToString } from "~/utils/field-editors";
import { NativeSelect, NativeSelectOption } from "../ui/native-select";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import React from "react";
import { Checkbox } from "../ui/checkbox";

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

/**
 * Highly extensible select options.
 */
export function multiSelectCheckboxEditor<U extends HasToString>({
  options,
}: {
  options: {
    label: string;
    value: U;
    fieldProps?: React.ComponentProps<typeof Field>;
  }[];
}): FieldEditor<unknown, U[]> {
  return ({ overrides, onChange, onBlur, value: orig }) => {
    const [items, setItems] = useState(orig ?? []);
    return (
      <FieldGroup className="gap-3 p-3">
        {options.map((option) => {
          const id = (overrides.id ?? "") + option.label;
          return (
            <Field orientation="horizontal" {...option.fieldProps}>
              <Checkbox
                id={id}
                checked={items.includes(option.value)}
                onCheckedChange={(checked) => {
                  const add = checked ? [option.value] : [];
                  const newItems = [
                    ...items.filter((x) => x !== option.value),
                    ...add,
                  ];
                  setItems(newItems);
                  onChange(newItems);
                }}
                onBlur={() => onBlur(items)}
              />
              <FieldLabel htmlFor={id}>{option.label}</FieldLabel>
            </Field>
          );
        })}
      </FieldGroup>
    );
  };
}
