import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { Course, PaymentStatus, Profile } from "@backend/database/schema";
import { useParams } from "react-router";
import { type ColumnDef } from "@tanstack/react-table";
import type { ReservationDto } from "@backend/database/dtos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PageHeader } from "~/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useTRPC, useTRPCClient } from "~/utils/trpc";
import { DataTable } from "~/components/ui/data-table";
import { Button } from "~/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "~/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "~/components/ui/select";
import { PaymentStatusBadge } from "~/components/payment-status-badge";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { Users, CreditCard, Calendar, History } from "lucide-react";



export function CourseDetails() {
    const { courseId } = useParams<{courseId: string}>();
    const enabled = !!courseId;
    const trpc = useTRPC();
    const client = useTRPCClient();
    const queryClient = useQueryClient();
    

    const course = useQuery(
        trpc.courseManagerRouter.getCourseById.queryOptions({ id: courseId!}, { enabled: enabled})
    )
    
    const reservations = useQuery(
        trpc.courseManagerRouter.getReservationsByCourse.queryOptions({ courseId: courseId!}, {enabled: enabled}),
    )

    const trainees = useQuery(
        trpc.adminRouter.getTrainees.queryOptions()
    )

    const courseEvents = useQuery(
        trpc.courseManagerRouter.getCourseEventsByCourse.queryOptions({courseId: courseId!})
    )


    //grouping reservations by courseEventId to easily access rosters
    const reservationsList = reservations.data ?? [];
    const events = courseEvents.data ?? [];
    
    const reservationsByEvent: Record<string, ReservationDto[]> = Object.fromEntries(
        events.map((e) => [e.id, []])
    );

    for (const r of reservationsList) {
        if (r.courseEventId && reservationsByEvent[r.courseEventId]) {
          reservationsByEvent[r.courseEventId]?.push(r);
        }
    }

    //getting courseEvents for tabs
    const eventIds = courseEvents.data?.map(e => e.id) ?? [];

    async function deleteRow(profileId: string, courseEventId: string) {
        await client.courseManagerRouter.deleteReservation.mutate({ profileId, courseEventId});
        await queryClient.invalidateQueries({
            queryKey: trpc.courseManagerRouter.getReservationsByCourse.queryKey({courseId: courseId!}),
        });
    }
    
    //determining if a roster has reached capacity
    function classFull(courseEventId: string) {
        const roster = reservationsByEvent[courseEventId] ?? [];
        const event = courseEvents.data?.find(e => e.id === courseEventId);

        const seats = event?.seats ?? 0;

        return roster.length >= seats;
    }

    //what percentage of trainees enrolled have paid their fees
    function percentagePaid() {
        let paid = 0;
        for (let i=0; i < reservationsList.length; i++) {
            if (reservationsList[i]?.paymentStatus == "paid")
                paid++;
        }
        return paid / reservationsList.length * 100;
    }


    //separating upcoming and past events
    const upcomingEvents = [];
    const pastEvents = [];
    const date = Date.now();
    

    for (let i=0; i < reservationsList.length; i++) {
        let eventTime = Number(reservationsList[i]?.classStartDatetime) 
        if (eventTime > date) {
            upcomingEvents.push(reservationsList[i]);
        } else {
            pastEvents.push(reservationsList[i]);
        }
    }

    //for if the course gets deleted
    const [courseDeleted, setCourseDeleted] = useState<boolean | false>(false)

    //for adding to roster
    const [selectedTrainee, setSelectedTrainee] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [traineePopupOpen, setTraineePopupOpen] = useState<boolean |false>(false);
    const activeEventId = selectedTab ?? eventIds[0] ?? "";

    const openRoster = activeEventId ? reservationsByEvent[activeEventId] ?? [] : [];
    const rosterIds = new Set(openRoster.map((r) => r.profileId));
    const availableTrainees = trainees.data?.filter((t) => !rosterIds.has(t.id)) ?? [];

    
    
    //Data Table
    const rosterTableDef: ColumnDef<ReservationDto>[] = [
        {
            accessorKey: "lastName",
            header: "Last Name"
        },
        {
            accessorKey: "firstName",
            header: "First Name"
        },
        {
            accessorKey: "creditHours",
            header: "Awarded Hours"
        },
        {
            accessorKey: "isMember",
            header: "Member Status",
            cell: ({ getValue }) => (getValue() == true ? (<Badge variant="purple"> Member</Badge>) : (<Badge variant="blue"> Non-Member</Badge>)),
        },
        {
            accessorKey: "paymentStatus",
            header: "Payment Status",
            cell: ({ getValue }) => (<PaymentStatusBadge value={getValue() as PaymentStatus}/> )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <Button variant="destructive" onClick={() => deleteRow(row.original.profileId, row.original.courseEventId)}>    
                        Remove Trainee
                    </Button>
                );
            }
        }
        
    ]

    if (courseDeleted) {
        return (
            <div className="flex-1 flex items-center justify-center">
            <h1 className = "text-2xl font-semibold">This course has been deleted. Return to <Link className="text-blue-500 underline" to = "/admin/course-manager"> course manager.</Link></h1>
            </div>
        )   
    }

    return (
        <div className="flex-1">
            <PageHeader>{course.data?.courseName}</PageHeader>
            <div className="grid gap-4 grid-cols-1 @xl:grid-cols-8">
                <Card className="@xl: col-span-2">
                    <CardContent className="p-6 flex items-center gap-4">
                    <Users className="w-10 h-10 text-muted-foreground" />
                    <div className="flex flex-col">
                        <p className="text-sm text-muted-foreground">Total Enrollment</p>
                        <p className="text-3xl font-bold">{reservationsList.length}</p>
                    </div>
                    </CardContent>
                </Card>
                <Card className="@xl: col-span-2">
                <CardContent className="p-6 flex items-center gap-4">
                    <CreditCard className="w-10 h-10 text-muted-foreground" />
                        <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">Tution Paid</p>
                            <p className="text-3xl font-bold">{percentagePaid().toFixed(0)}%</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="@xl: col-span-2">
                    <CardContent className="p-6 flex items-center gap-4">
                        <Calendar className="w-10 h-10 text-muted-foreground" />
                        <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">Upcoming Events</p>
                            <p className="text-3xl font-bold">{upcomingEvents.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="@xl: col-span-2">
                    <CardContent className="p-6 flex items-center gap-4">
                        <History className="w-10 h-10 text-muted-foreground" />
                        <div className="flex flex-col">
                            <p className="text-sm text-muted-foreground">Past Events</p>
                            <p className="text-3xl font-bold">{pastEvents.length}</p>
                        </div>
                    </CardContent>
                </Card>
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
                            <div>
                                <Button variant="secondary" size="lg" className="w-full">
                                    Edit Course
                                </Button>
                            </div>
                            <div>
                                <Button 
                                    variant="destructive" 
                                    size="lg" 
                                    className='w-full' 
                                    onClick={async () => {
                                        if (confirm("Are you sure you want to delete this course? All course information and reservations will be lost.")) {
                                            await client.courseManagerRouter.deleteCourse.mutate({id: courseId!});
                                            await queryClient.invalidateQueries({
                                                queryKey: trpc.courseManagerRouter.getCourses.queryKey(),
                                            });
                                            setCourseDeleted(true);
                                        } else {
                                            return;
                                        }
                                    }}>
                                    Delete Course
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="@xl:col-span-6">
                    <CardHeader className="pb-3">
                        <CardTitle>Class Roster {<Badge variant={classFull(activeEventId) ? "destructive" : "outline"}>{classFull(activeEventId) ? "Full" : "Open"}</Badge>}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={selectedTab ?? eventIds[0] ?? ""} onValueChange={setSelectedTab}>
                            <TabsList variant="line">
                                {courseEvents.data?.map((event) => {
                                    const date = event.classStartDatetime
                                        ? new Date(event.classStartDatetime)
                                        : null;
                                    return (
                                        <TabsTrigger key={event.id} value={event.id}>
                                            {date ? date.toLocaleDateString() : "-"}
                                        </TabsTrigger>
                                );
                            })}
                            </TabsList>
                            {courseEvents.data?.map((event) => (
                                <TabsContent key ={event.id} value={event.id}>
                                    <Card>
                                        <CardContent>
                                            <DataTable 
                                                columns={rosterTableDef}
                                                data={(reservationsByEvent[event.id] as ReservationDto[]) ?? []}
                                            />  
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>
                        <div className="flex justify-end mt-4 pr-4">
                            <Dialog open={traineePopupOpen} onOpenChange={setTraineePopupOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" size="lg">+ Add Trainee To Roster</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            New Enrollment
                                        </DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>
                                        select a trainee to add to the roster
                                    </DialogDescription>
                                        <Select 
                                            required
                                            onValueChange={(value)=>setSelectedTrainee(value)}>
                                            <SelectTrigger id="trainees" className="w-full max-w-48">
                                                <SelectValue placeholder="Select a Trainee"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {availableTrainees.map((trainee: Profile) => (
                                                        <SelectItem key={trainee.id} value={trainee.id}>
                                                            {trainee.firstName} {trainee.lastName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            onClick={async () => {
                                                if (!selectedTrainee) return;

                                                await client.courseManagerRouter.addReservation.mutate({
                                                    profileId: selectedTrainee,
                                                    courseEventId: activeEventId ?? "",
                                                    creditHours: course.data?.creditHours ?? 0,
                                                    paymentStatus: "unpaid",
                                                });

                                                await queryClient.invalidateQueries(
                                                    trpc.courseManagerRouter.getReservationsByCourse.queryKey({
                                                    courseId: courseId!,
                                                    })
                                                );
                                                
                                                setTraineePopupOpen(false);
                                            }}
                                            disabled = {classFull(activeEventId)}
                                        >
                                            add to roster
                                        </Button>
                                </DialogContent>
                            </Dialog>  
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
