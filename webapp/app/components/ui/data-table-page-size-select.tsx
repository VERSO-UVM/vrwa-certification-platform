import { type Table } from "@tanstack/react-table";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "./select";
import { Field, FieldLabel } from "./field";

interface DataTablePageSizeSelectProps<
  TData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
}

export function DataTablePageSizeSelect<TData>({
  table,
  className,
  ...props
}: DataTablePageSizeSelectProps<TData>) {
  const MAX_PAGE_SIZE = 10000;
  const onSetPageSize = (value: string) => {
    table.setPageSize(Number(value));
  };
  const currentSize = table.getState().pagination.pageSize;

  return (
    <div className={cn("flex", className)} {...props}>
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel
          htmlFor="select-rows-per-page"
          className="text-muted-foreground"
        >
          Rows per page
        </FieldLabel>
        <Select value={String(currentSize)} onValueChange={onSetPageSize}>
          <SelectTrigger className="w-20" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value={MAX_PAGE_SIZE.toString()}>All</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}
