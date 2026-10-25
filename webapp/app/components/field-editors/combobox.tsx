/**
 * Combobox input fields. A combobox is a mix between a text input and a select.
 * They're pretty common now and a good UX.
 *
 * Current issue with the shadcn/ui Combobox component: Combobox will not work perfectly inside of drawers/modals. This is not good.
 */
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
 * Multiselect combobox that allows selecting from suggestions and also creating
 * custom values. For free-form string[] fields.
 * This is based off the shadcn/ui example.
 */
export function MultiComboboxEditor({
  overrides,
  onChange,
  onBlur,
  value: orig,
  options = [],
}: FieldEditorProps<unknown, string[]> & { options?: string[] }) {
  /* The "selected" here is the whole string[] array */
  const [selected, setSelected] = useState(orig ?? []);
  /* The current text in the search box */
  const [search, setSearch] = useState("");
  /* Needed for ComboboxChips component */
  const anchor = useComboboxAnchor();
  /* Don't allow duplicate items */
  const unselected = useMemo(
    () => options.filter((option) => !selected.includes(option)),
    [options, selected],
  );

  const trimmedQuery = search.trim().toLowerCase();
  const matchesItem =
    unselected.some((x) => x.toLowerCase() === trimmedQuery) ||
    selected.some((x) => x.toLowerCase() === trimmedQuery);

  /* Display option to add custom item? */
  const canCreate = trimmedQuery.length > 0 && !matchesItem;

  return (
    <Combobox
      multiple
      autoHighlight
      items={unselected}
      value={selected}
      inputValue={search}
      onValueChange={(next) => {
        const nextValue = next ?? [];
        setSelected(nextValue);
        setSearch("");
        onChange(nextValue);
      }}
      onInputValueChange={(next) => setSearch(next)}
      {...overrides}
    >
      <ComboboxChips
        ref={anchor}
        className="w-full"
        onBlur={() => onBlur(selected)}
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

/**
 * Convience wrapper around ComboboxEditor to use in meta.editor ColumnDef.
 */
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
 * Single-select combobox input. Must select on of many options either by typing
 * it in and hitting enter or by scrolling.
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
  const [item, setItem] = useState(
    options.find((opt) => opt.value === orig) ?? null,
  );

  return (
    <Combobox
      value={item}
      onValueChange={(val) => {
        if (val != null) {
          setItem(val);
          onChange(val.value);
          onBlur(val.value);
        }
      }}
      /* The Combobox componnt automatically recognizes items in
       * { label, value } format, otherwise we'd need to set
       * itemToStringLabel and itemToStringValue */
      items={options}
      autoHighlight
      {...overrides}
    >
      <ComboboxInput placeholder="" />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>

        <ComboboxList>
          {(item: { label: string; value: U }) => (
            <ComboboxItem key={item.value.toString()} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
