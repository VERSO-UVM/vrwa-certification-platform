import type { Route } from "./+types/registration";
import { format } from "date-fns";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CourseDto } from "@backend/database/dtos";
import { useTRPC } from "~/utils/trpc";
import { PageHeader } from "~/components/page-header";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { courseStartDate } from "~/utils/utils";
import { Undo } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA - Course Registration" }];
}

const classCardVariants = ["blue", "green", "yellow", "orange"] as const;
const ALL_FILTER = "all";

const columnHelper = createColumnHelper<CourseDto>();

const columns = [
  columnHelper.accessor("courseName", {}),
  columnHelper.accessor((row) => row?.sessions[0]?.venue ?? "", {
    id: "venue",
  }),
  columnHelper.accessor((row) => row?.sessions[0]?.physicalAddress ?? "", {
    id: "physicalAddress",
  }),
  columnHelper.accessor((row) => row?.sessions[0]?.town ?? "", {
    id: "town",
  }),

  /* For global quick search */
  columnHelper.accessor(
    (row) => {
      const start = courseStartDate(row);
      return start ? format(start, "LLLL d, y") : "";
    },
    {
      id: "date",
    },
  ),

  /* For filtering by month using column filtering */
  columnHelper.accessor(
    (row) => {
      const start = courseStartDate(row);
      return start ? format(start, "yyyy-MM") : "";
    },
    {
      id: "month",
      enableGlobalFilter: false,
    },
  ),
];

export default function CourseRegistrationPage() {
  const trpc = useTRPC();
  const { data: courses } = useQuery(
    trpc.courses.trainee.listFuture.queryOptions(),
  );

  const data = useMemo(
    () => courses?.filter((c) => courseStartDate(c) != null) ?? [],
    [courses],
  );

  const monthOptions = useMemo(() => {
    // Get unique month/years
    // Assume course data is already sorted
    const months = new Map<string, Date>();
    for (const course of data) {
      const start = courseStartDate(course);
      if (!start) continue;
      // Match format in month column accessor
      months.set(format(start, "yyyy-MM"), start);
    }
    return [
      ...months
        .entries()
        .map(([value, date]) => ({ value, label: format(date, "LLLL yyyy") })),
    ];
  }, [data]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const course of data) {
      const town = course.sessions?.[0]?.town;
      if (town) cities.add(town);
    }
    return [...cities].sort((a, b) => a.localeCompare(b));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const globalFilter =
    (table.getState().globalFilter as string | undefined) ?? "";
  const monthFilter =
    (table.getColumn("month")?.getFilterValue() as string | undefined) ??
    ALL_FILTER;
  const cityFilter =
    (table.getColumn("town")?.getFilterValue() as string | undefined) ??
    ALL_FILTER;
  const filtersActive =
    globalFilter.length > 0 ||
    monthFilter !== ALL_FILTER ||
    cityFilter !== ALL_FILTER;

  function resetFilters() {
    table.resetGlobalFilter();
    table.resetColumnFilters();
  }

  const rows = table.getRowModel().rows;

  return (
    <>
      <PageHeader>Upcoming Trainings</PageHeader>

      <div className="flex flex-wrap items-center gap-3 px-4 pb-2">
        <Input
          placeholder="Quick search..."
          value={globalFilter}
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          className="max-w-sm"
        />
        <Select
          value={monthFilter}
          onValueChange={(value) =>
            table
              .getColumn("month")
              ?.setFilterValue(value === ALL_FILTER ? undefined : value)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All months</SelectItem>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={cityFilter}
          onValueChange={(value) =>
            table
              .getColumn("town")
              ?.setFilterValue(value === ALL_FILTER ? undefined : value)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER}>All cities</SelectItem>
            {cityOptions.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          disabled={!filtersActive}
          onClick={resetFilters}
        >
          <Undo /> Reset filters
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground px-4 py-8 text-center">
          No trainings match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3">
          {rows.map((row, i) => {
            const course = row.original;
            const start = courseStartDate(course)!;
            const session = course.sessions[0];
            const variant = classCardVariants[i % classCardVariants.length];
            const location =
              session?.locationType === "virtual"
                ? "Online"
                : [session?.physicalAddress, session?.town]
                    .filter(Boolean)
                    .join(", ") || "-";

            return (
              <Link to={course.id} key={course.id} className="m-4">
                <Card variant={variant}>
                  <CardHeader>
                    <CardTitle>{course.courseName}</CardTitle>
                    <CardAction>
                      <div className="flex flex-col items-center leading-none">
                        <span className="text-2xl font-bold">
                          {format(start, "d")}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wide">
                          {format(start, "LLL")}
                        </span>
                      </div>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex min-h-36 flex-col justify-between">
                    <dl className="grid grid-cols-1 gap-1">
                      <div className="flex space-x-2">
                        <dt className="font-medium">Date:</dt>
                        <dd>{format(start, "LLLL d, y")}</dd>
                      </div>
                      <div className="flex space-x-2">
                        <dt className="font-medium">Time:</dt>
                        <dd>{format(start, "p")}</dd>
                      </div>
                      <div className="flex space-x-2">
                        <dt className="font-medium">Venue:</dt>
                        <dd>{session?.venue ?? "-"}</dd>
                      </div>
                      <div className="flex space-x-2">
                        <dt className="font-medium">Location:</dt>
                        <dd>{location}</dd>
                      </div>
                      <div className="flex space-x-2">
                        <dt className="font-medium">Credits:</dt>
                        <dd>{course.creditHours} hrs</dd>
                      </div>
                    </dl>
                    {/* We already have a link around the whole card, this button is just for visual indication */}
                    <Button variant="secondary" className="mt-3">
                      Register
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
