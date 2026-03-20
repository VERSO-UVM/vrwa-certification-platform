import { type Table } from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationButton,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

interface DataTablePaginationProps<
  TData,
> extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>;
}

function pagination(pageIndex: number, pageCount: number): (string | number)[] {
  const numButtons = 7;

  if (pageCount <= numButtons) {
    // No ellipsis needed
    return Array.from({ length: pageCount }, (_, i) => i);
  }

  // 0 1 2 3 4 ... 8
  //     ^
  if (pageIndex <= 3) {
    // Only right ellipsis
    return [
      ...Array.from({ length: 5 }, (_, i) => i),
      "rightEllipsis",
      pageCount - 1,
    ];
  }

  // 0 ... 4 5 6 7 8
  //         ^
  if (pageCount - 1 - pageIndex <= 3) {
    // Only left ellipsis
    const start = pageCount - 5;
    return [
      0,
      "leftEllipsis",
      ...Array.from({ length: 5 }, (_, i) => start + i),
    ];
  }

  // 0 ... 3 4 5 ... 8
  //         ^
  // Left and right ellipsis
  return [
    0,
    "leftEllipsis",
    pageIndex - 1,
    pageIndex,
    pageIndex + 1,
    "rightEllipsis",
    pageCount - 1,
  ];
}

export function DataTablePagination<TData>({
  table,
  ...props
}: DataTablePaginationProps<TData>) {
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  if (pageCount == 1) {
    return <div></div>;
  }
  const items = pagination(pageIndex, pageCount);

  return (
    <Pagination className="justify-left w-fit mx-0" {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => table.previousPage()} />
        </PaginationItem>
        {items.map((item, i) =>
          typeof item == "number" ? (
            <PaginationButton
              isActive={item == pageIndex}
              onClick={(ev) => table.setPageIndex(item)}
              key={item.toString()}
            >
              {item + 1}
            </PaginationButton>
          ) : (
            <PaginationEllipsis key={item} />
          ),
        )}
        <PaginationItem>
          <PaginationNext onClick={() => table.nextPage()} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
