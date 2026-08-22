import React, { useMemo, useState } from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import type { FieldEditor } from "~/utils/field-editors";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "~/components/ui/combobox";

/**
 * Multiselect combobox that allows selecting from suggestions and creating
 * custom values. For free-form string[] fields.
 */
export function multiComboboxEditor({
  options = [],
  props,
}: {
  options?: string[];
  props?: React.ComponentProps<typeof Combobox>;
} = {}): FieldEditor<unknown, string[]> {
  return ({ overrides, onChange, onBlur, value: orig }) => {
    const [value, setValue] = useState(orig ?? []);
    const [query, setQuery] = useState("");
    const anchor = useComboboxAnchor();
    const filter = ComboboxPrimitive.useFilter({ sensitivity: "base" });

    const trimmedQuery = query.trim();
    const queryExists = options.some(
      (option) => option.toLowerCase() === trimmedQuery.toLowerCase(),
    );
    const canCreate = trimmedQuery.length > 0 && !queryExists;

    const visibleItems = useMemo(() => {
      const filtered = options.filter(
        (option) => !value.includes(option) && filter.contains(option, query),
      );
      if (canCreate && !value.includes(trimmedQuery)) {
        return [trimmedQuery, ...filtered];
      }
      return filtered;
    }, [options, value, filter, query, canCreate, trimmedQuery]);

    return (
      <Combobox
        multiple
        autoHighlight
        items={visibleItems}
        // Filtering is handled externally so the creatable query item stays visible.
        filter={null}
        value={value}
        inputValue={query}
        onValueChange={(next) => {
          const nextValue = (next ?? []) as string[];
          setValue(nextValue);
          setQuery("");
          onChange(nextValue);
        }}
        onInputValueChange={(next) => setQuery(next)}
        {...props}
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
                <ComboboxChipsInput placeholder="Add tag..." />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Type to add a new value.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {canCreate && item === trimmedQuery
                  ? `Create "${item}"`
                  : item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  };
}
