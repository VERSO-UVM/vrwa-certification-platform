import { useState } from "react";
import type { FieldEditor } from "~/utils/field-editors";
import { Textarea } from "../ui/textarea";

/**
 * Generic input editor.
 */
export function textAreaEditor(
  props?: React.ComponentProps<typeof Textarea>,
): FieldEditor<unknown, string> {
  return ({ overrides, onChange, onBlur, value: orig }) => {
    const [value, setValue] = useState(orig);
    return (
      <Textarea
        value={value?.toString() ?? ""}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
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
