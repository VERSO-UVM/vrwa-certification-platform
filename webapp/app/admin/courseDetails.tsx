import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { Course, Profile } from "@backend/database/schema";
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



export function CourseDetails() {
    const trpc = useTRPC();
    const client = useTRPCClient();
    const queryClient = useQueryClient();
    const { courseId } = useParams();

    async function deleteRow(profileId: string, courseEventId: string) {
    
        await client.courseManagerRouter.deleteReservation.mutate({ profileId, courseEventId});
    
    
        await queryClient.invalidateQueries({
            queryKey: trpc.adminRouter.getReservationsByCourse.queryKey({courseId: courseId!}),
        });
    }
    
    const course = useQuery<Course>(
        trpc.courseManagerRouter.getCourseById.queryOptions({ id: courseId!})
    )
    
    const reservations = useQuery<ReservationDto[]>(
        trpc.courseManagerRouter.getReservationsByCourse.queryOptions({ courseId: courseId!, }),
    )

    const trainees = useQuery<Profile[]>(
        trpc.adminRouter.getTrainees.queryOptions()
    )

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
    
    //grouping reservations by courseEventId to easily access rosters
    const reservationsList = reservations.data ?? [];
    const reservationsByEvent = reservationsList.reduce<Record<string, ReservationDto[]>>(
        (rosters, reservation) => {
            const key = reservation.courseEventId;
            if (!rosters[key]) {
                rosters[key] = [];
            }
            rosters[key].push(reservation);
            return rosters;    
        }, {}
    );

    //getting courseEvents for tabs
    const eventIds = Object.keys(reservationsByEvent);

    //for adding to roster
    const [selectedTrainee, setSelectedTrainee] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string | null>(null);
    const [traineePopupOpen, setTraineePopupOpen] = useState<boolean |false>(false);

    const openRoster = selectedTab ? reservationsByEvent[selectedTab] ?? [] : [];
    const rosterIds = new Set(openRoster.map((r) => r.profileId));
    const availableTrainees = trainees.data?.filter((t) => !rosterIds.has(t.id)) ?? [];

    
    

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
                            <div>
                                <Button variant="secondary" size="lg" className="w-full">
                                    Edit Course
                                </Button>
                            </div>
                            <div>
                                <Button variant="destructive" size="lg" className='w-full'>
                                    Delete Course
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="@xl:col-span-6">
                    <CardHeader className="pb-3">
                        <CardTitle>Class Rosters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={eventIds[0]}>
                            <TabsList variant="line">
                                {eventIds.map((eventId) => {
                                    const eventReservations = reservationsByEvent[eventId];
                                    const dateString = eventReservations?.[0]?.classStartDatetime;
                                    const date = dateString ? new Date(dateString) : null;
                                    return (
                                        <TabsTrigger key={eventId} value={eventId} onSelect={() => setSelectedTab(eventId)}>
                                            {date ? date.toLocaleDateString() : "-"}
                                        </TabsTrigger>
                                );
                            })}
                            </TabsList>
                            {eventIds.map((eventId) => (
                                <TabsContent key ={eventId} value={eventId}>
                                    <Card>
                                        <CardContent>
                                            <DataTable 
                                                columns={rosterTableDef}
                                                data={(reservationsByEvent[eventId] as ReservationDto[]) ?? []}
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
                                                    courseEventId: selectedTab,
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
