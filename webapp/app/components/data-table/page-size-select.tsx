import { type Table } from "@tanstack/react-table";
import { cn } from "~/utils/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "~/components/ui/select";
import { Field, FieldLabel } from "~/components/ui/field";

interface DataTablePageSizeSelectProps<
  TData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
}

export const PAGE_SIZE_SHOW_ALL = {
  label: "All",
  // It might not be a good idea to render more than 10_000 anyways
  value: 10_000,
  showAlways: true,
} as PageSizeValues;
export type PageSizeValues = {
  label: string;
  value: number;
  showAlways?: boolean;
};

export function DataTablePageSizeSelect<TData>({
  table,
  className,
  ...props
}: DataTablePageSizeSelectProps<TData>) {
  const onSetPageSize = (value: string) => {
    table.setPageSize(Number(value));
  };
  const currentSize = table.getState().pagination.pageSize;
  const pageSizeOptions = table.options.meta?.pageSizeOptions;
  // Hide options that don't make sense to display
  const totalRows = table.getCoreRowModel().rows.length;
  const availableOptions = (pageSizeOptions ?? []).filter(
    (option) => option.showAlways || option.value < totalRows,
  );
  // And hide the selector entirely if we're not left with multiple options
  // to choose from
  if (availableOptions.length <= 1) {
    return <div></div>;
  }

  return (
    <div className={cn("flex", className)} {...props}>
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel
          htmlFor="select-rows-per-page"
          className="text-muted-foreground"
        >
          Rows shown
        </FieldLabel>
        <Select value={String(currentSize)} onValueChange={onSetPageSize}>
          <SelectTrigger className="w-20" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              {availableOptions.map(({ label, value }) => (
                <SelectItem key={value} value={value.toString()}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
