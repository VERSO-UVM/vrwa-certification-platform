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

export const MAX_PAGE_SIZE = 10_000;

/**
 * Include a show all option and hide other unnecessary options.
 */
export function smartPageSizeOptions<TData>(
  table: Table<TData>,
  pageSizeOptions: PageSizeValues[],
): PageSizeValues[] {
  const totalRows = table.getCoreRowModel().rows.length;
  return [
    ...pageSizeOptions.filter((option) => option.value < totalRows),
    {
      label: `All (${totalRows})`,
      // It's better to set this to a fixed value, so state doesn't become
      // invalid when we add or remove a row
      // value: totalRows,
      value: MAX_PAGE_SIZE,
    },
  ];
}

export type PageSizeValues = {
  label: string;
  value: number;
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
  const pageSizeOptions = table.options.meta?.pageSizeOptions(table);
  if (!pageSizeOptions || pageSizeOptions.length <= 1) {
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
              {pageSizeOptions.map(({ label, value }) => (
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
