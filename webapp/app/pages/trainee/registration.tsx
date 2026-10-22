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
import type { CourseEventDto } from "@backend/database/dtos";
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

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA - Course Registration" }];
}

const classCardVariants = ["blue", "green", "yellow", "orange"] as const;
const ALL_FILTER = "all";

const columnHelper = createColumnHelper<CourseEventDto>();

const columns = [
  columnHelper.accessor("courseName", {}),
  columnHelper.accessor("venue", {}),
  columnHelper.accessor("physicalAddress", {}),
  columnHelper.accessor("town", {
    filterFn: "equalsString",
  }),
  columnHelper.accessor(
    (row) =>
      row.classStartDatetime
        ? format(row.classStartDatetime, "yyyy-MM")
        : "",
    {
      id: "month",
      filterFn: "equalsString",
      enableGlobalFilter: false,
    },
  ),
];

export default function CourseRegistrationPage() {
  const trpc = useTRPC();
  const { data: courseEvents } = useQuery(
    trpc.courseEvents.trainee.listFuture.queryOptions(),
  );

  const data = useMemo(
    () => courseEvents?.filter((e) => e.classStartDatetime) ?? [],
    [courseEvents],
  );

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>();
    for (const event of data) {
      if (!event.classStartDatetime) continue;
      const value = format(event.classStartDatetime, "yyyy-MM");
      if (!months.has(value)) {
        months.set(value, format(event.classStartDatetime, "LLLL yyyy"));
      }
    }
    return [...months.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));
  }, [data]);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const event of data) {
      if (event.town) cities.add(event.town);
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

  const monthFilter =
    (table.getColumn("month")?.getFilterValue() as string | undefined) ??
    ALL_FILTER;
  const cityFilter =
    (table.getColumn("town")?.getFilterValue() as string | undefined) ??
    ALL_FILTER;

  const rows = table.getRowModel().rows;

  return (
    <>
      <PageHeader>Upcoming Trainings</PageHeader>

      <div className="flex flex-wrap items-center gap-3 px-4 pb-2">
        <Input
          placeholder="Quick search..."
          value={table.getState().globalFilter ?? ""}
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
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground px-4 py-8 text-center">
          No trainings match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3">
          {rows.map((row, i) => {
            const training = row.original;
            const start = training.classStartDatetime!;
            const variant = classCardVariants[i % classCardVariants.length];
            const location =
              training.locationType === "virtual"
                ? "Online"
                : [training.physicalAddress, training.town]
                    .filter(Boolean)
                    .join(", ") || "-";
            const credits = [
              `${training.creditHours} hrs`,
              training.creditHourCategories?.length
                ? training.creditHourCategories.join(", ")
                : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <Link to={training.id} key={training.id} className="m-4">
                <Card variant={variant}>
                  <CardHeader>
                    <CardTitle>{training.courseName}</CardTitle>
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
                        <dd>{format(start, "eeee, LLLL d")}</dd>
                      </div>
                      <div className="flex space-x-2">
                        <dt className="font-medium">Time:</dt>
                        <dd>{format(start, "p")}</dd>
                      </div>
                      <div className="flex space-x-2">
                        <dt className="font-medium">Venue:</dt>
                        <dd>{training.venue ?? "-"}</dd>
                      </div>
                      <div className="flex space-x-2">
                        <dt className="font-medium">Location:</dt>
                        <dd>{location}</dd>
                      </div>
                      <div className="flex space-x-2">
                        <dt className="font-medium">Credits:</dt>
                        <dd>{credits}</dd>
                      </div>
                    </dl>
                    {/* We already have a link around the whole card, this button is just for visual indication */}
                    <Button variant="secondary" className="mt-3">Register</Button>
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
