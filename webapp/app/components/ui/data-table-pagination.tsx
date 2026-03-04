import { type Table } from "@tanstack/react-table";
import { cn } from "~/lib/utils";
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

function pagination<T>(
  pageIndex: number,
  pageCount: number,
  ellipsis: T,
  pageButton: (i: number) => T,
): T[] {
  const numButtons = 7;

  if (pageCount <= numButtons) {
    // No ellipsis needed
    return Array.from({ length: pageCount }, (_, i) => pageButton(i));
  }

  // 0 1 2 3 4 ... 8
  //     ^
  if (pageIndex <= 3) {
    // Only right ellipsis
    console.log("Only right ellipsis");
    return [
      ...Array.from({ length: 5 }, (_, i) => pageButton(i)),
      ellipsis,
      pageButton(pageCount - 1),
    ];
  }

  // 0 ... 4 5 6 7 8
  //         ^
  if (pageCount - 1 - pageIndex <= 3) {
    // Only left ellipsis
    const start = pageCount - 1 - 5;
    return [
      pageButton(0),
      ellipsis,
      ...Array.from({ length: 5 }, (_, i) => pageButton(i + start)),
    ];
  }

  // 0 ... 3 4 5 ... 8
  //         ^
  // Left and right ellipsis
  return [
    pageButton(0),
    ellipsis,
    pageButton(pageIndex - 1),
    pageButton(pageIndex),
    pageButton(pageIndex + 1),
    ellipsis,
    pageButton(pageCount - 1),
  ];
}

export function DataTablePagination<TData>({
  table,
  ...props
}: DataTablePaginationProps<TData>) {
  const { pageSize, pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  console.log(pageCount);
  if (pageCount == 1) {
    return <div></div>;
  }
  const ellipsesThreshhold = 6;
  const buttons = pagination(
    pageIndex,
    pageCount,
    <PaginationEllipsis />,
    (i) => (
      <PaginationButton
        isActive={i == pageIndex}
        onClick={() => table.setPageIndex(i)}
      >
        {i + 1}
      </PaginationButton>
    ),
  );

  return (
    <Pagination {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => table.previousPage()} />
        </PaginationItem>
        {buttons.map((item) => (
          <PaginationItem>{item}</PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext onClick={() => table.nextPage()} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
