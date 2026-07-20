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
} as PageSizeValues;
export type PageSizeValues = { label: string; value: number };

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
  // Page size selector can be disabled this way
  if (!pageSizeOptions) {
    // Still use a div not a <></> so there is an element there
    return <div></div>;
  }
  // Also, if there are less than 5 / the smallest available
  // option, don't bother showing the page size select at all
  const smallestValue = Math.min(
    ...pageSizeOptions.map((option) => option.value),
  );
  if (table.getCoreRowModel().rows.length <= smallestValue) {
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
              {pageSizeOptions?.map(({ label, value }) => (
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
