import { useState } from "react";
import type { FieldEditorProps } from "~/utils/field-editors";
import { Textarea } from "../ui/textarea";

export type TextAreaEditorProps = FieldEditorProps<
  unknown,
  string,
  React.ComponentProps<typeof Textarea>
>;

export function textAreaEditor(props?: React.ComponentProps<typeof Textarea>) {
  return (ctx: TextAreaEditorProps) => (
    <TextAreaEditor
      {...ctx}
      key={ctx.value.toString() ?? ""}
      overrides={{ ...props, ...ctx.overrides }}
    />
  );
}

function TextAreaEditor({
  overrides,
  onChange,
  onBlur,
  value: orig,
}: TextAreaEditorProps) {
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
      {...overrides}
    />
  );
}
