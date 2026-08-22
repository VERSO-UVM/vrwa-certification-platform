/**
 * Customizable generic editors to use in the meta.editor ColumnDef
 * property. The idea is for these functions to be highly re-usable. They
 * have no direct dependencies on any React-Table things, so they may be
 * used in other contexts.
 *
 * Currently still missing:
 *
 * - [ ] Checkbox
 * - [ ] Radio
 * - [x] Date input
 */

export * from "~/components/field-editors/text-area";
export {
  intInputEditor,
  priceCentsEditor,
  stringInputEditor as textInputEditor,
  genericInputEditor,
} from "~/components/field-editors/input";
export * from "~/components/field-editors/select";
export * from "~/components/field-editors/date";
export * from "~/components/field-editors/combobox";

/**
 * I didn't see a built-in interface for props for generic form fields that exist
 * in <input>, <select>, etc. This can be updated with any of those.
 */
export interface FormFieldProps {
  id?: string; /* To match <label> `for` attribute */
  required?: boolean;
}

export interface FieldEditorProps<
  TData,
  TValue,
  /* Properties of form field. */
  TFieldProps extends FormFieldProps = FormFieldProps,
> {
  /**
   * Get current value of the field.
   */
  value: TValue;

  /**
   * If an editor does not need to see other values, use
   * FieldEditor<unknown, TValue>.
   */
  getRow: () => TData;

  overrides: Partial<TFieldProps>;

  onChange: (value: TValue) => void;

  /**
   * Use onBlur for things like querying or updating the
   * database or validating or sending messages to the user.
   * I loathe when apps show me error messages before I've finished
   * typing.
   */
  onBlur: (value: TValue) => void;
}

export type FieldEditor<TData, TValue> = (
  item: FieldEditorProps<TData, TValue>,
) => React.ReactNode;

export interface HasToString {
  toString(): string;
}
