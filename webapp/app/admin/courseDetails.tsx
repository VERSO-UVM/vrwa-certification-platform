import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { type ColumnDef } from "@tanstack/react-table";
import type { ReservationDto } from "@backend/database/dtos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PageHeader } from "~/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useTRPC } from "~/utils/trpc";
import { DataTable } from "~/components/ui/data-table";

const rosterTableDef: ColumnDef<ReservationDto>[] = [
    {
        accessorKey: "firstName",
        header: "First Name"
    },
    {
        accessorKey: "lastName",
        header: "Last Name"
    },
    {
        accessorKey: "isMember",
        header: "Member Status",
        cell: ({ getValue }) => (getValue() == true ? "Member" : "Non-Member"),
    },
    {
        accessorKey: "paymentStatus",
        header: "Payment Status",
    },
    
]

export function CourseDetails() {
    const trpc = useTRPC();
    const { courseId } = useParams();
    const course = useQuery(
        trpc.courseManagerRouter.getCourseById.queryOptions({ id: courseId!})
    )
    
    const reservations = useQuery(
        trpc.adminRouter.getReservations.queryOptions(),
    )

    const classDates = (reservations.data as ReservationDto[])?.filter(
        (res): res is ReservationDto & { classStartDatetime: Date } =>
            "classStartDatetime" in res && res.classStartDatetime instanceof Date
        ).map((res) => res.classStartDatetime)   ?? []; 



    return (
        <div className="flex-1">
            <PageHeader>{course.data?.courseName}</PageHeader>
            <div className="grid gap-4 grid-cols-1 @xl:grid-cols-8">
                <Card className="@xl:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle>Course Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div>
                                <p><b>Description:</b> {course.data?.description}</p>
                            </div>
                            <div>
                                <p><b>Enrollment Fee:</b> ${course.data?.priceCents / 100}</p>
                            </div>
                            <div>
                                <p><b>Credit Hours: </b> {course.data?.creditHours}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="@xl:col-span-6">
                    <CardHeader className="pb-3">
                        <CardTitle>Class Rosters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={classDates[0]?.toISOString()}>
                            <TabsList variant="line">
                                {classDates.map((date) => (
                                    <TabsTrigger value={date.toISOString()}>{date.toLocaleDateString()}</TabsTrigger>
                                ))}
                            </TabsList>
                            <TabsContent value="class">
                                <Card>
                                    <CardContent>
                                        <DataTable 
                                            columns={rosterTableDef}
                                            data={(reservations.data as ReservationDto[]) ?? []}
                                        />  
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
