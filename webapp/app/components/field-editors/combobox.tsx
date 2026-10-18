import React, { useMemo, useState } from "react";
import type { FieldEditorProps, HasToString } from "~/utils/field-editors";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "~/components/ui/combobox";

/**
 * Multiselect combobox that allows selecting from suggestions and creating
 * custom values. For free-form string[] fields.
 */
export function MultiComboboxEditor({
  overrides,
  onChange,
  onBlur,
  value: orig,
  options = [],
}: FieldEditorProps<unknown, string[]> & { options?: string[] }) {
  const [value, setValue] = useState(orig ?? []);
  const [search, setSearch] = useState("");
  const anchor = useComboboxAnchor();

  const items = useMemo(
    () => options.filter((option) => !value.includes(option)),
    [options, value],
  );

  const trimmedQuery = search.trim().toLowerCase();
  const matchesItem =
    options.some((o) => o.toLowerCase() === trimmedQuery) ||
    value.some((v) => v.toLowerCase() === trimmedQuery);
  const canCreate = trimmedQuery.length > 0 && !matchesItem;

  return (
    <Combobox
      multiple
      autoHighlight
      items={items}
      value={value}
      inputValue={search}
      onValueChange={(next) => {
        const nextValue = next ?? [];
        setValue(nextValue);
        setSearch("");
        onChange(nextValue);
      }}
      onInputValueChange={(next) => setSearch(next)}
      {...overrides}
    >
      <ComboboxChips
        ref={anchor}
        className="w-full"
        onBlur={() => onBlur(value)}
      >
        <ComboboxValue>
          {(values: string[]) => (
            <React.Fragment>
              {values.map((tag) => (
                <ComboboxChip key={tag}>{tag}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder="Add..." />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
        {canCreate && (
          <>
            <ComboboxSeparator />
            <ComboboxItem value={search.trim()} className="hover:bg-accent m-1">
              {`Add "${search.trim()}"`}
            </ComboboxItem>
          </>
        )}
      </ComboboxContent>
    </Combobox>
  );
}

export function comboboxEditor<U extends HasToString>({
  options,
}: {
  options: { label: string; value: U }[];
}) {
  return ({ ...props }: FieldEditorProps<unknown, U>) => (
    <ComboboxEditor {...props} options={options} />
  );
}

/**
 * Single-select combobox editor.
 */
export function ComboboxEditor<U extends HasToString>({
  overrides,
  onChange,
  onBlur,
  value: orig,
  options = [],
}: FieldEditorProps<unknown, U> & {
  options: { label: string; value: U }[];
}) {
  const [value, setValue] = useState(options.find((opt) => opt.value === orig) ?? null);
  const getLabel = (v: U) =>
    options.find((opt) => opt.value === v)?.label ?? v.toString();

  return (
    <Combobox
      value={value}
      onValueChange={(val) => {
        if (val != null) {
          setValue(val);
          onChange(val.value);
          onBlur(val.value);
        }
      }}
      items={options}
      autoHighlight
      {...overrides}
    >
      <ComboboxInput placeholder="" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>

        <ComboboxList>
          {(item: {label: string, value: U}) => (
            <ComboboxItem key={item.value.toString()} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
