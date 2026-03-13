import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { PageHeader } from "~/components/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useTRPC } from "~/utils/trpc";

export function CourseDetails() {
    const trpc = useTRPC();
    const { courseId } = useParams();
    const course = useQuery(
        trpc.courseManagerRouter.getCourseById.queryOptions({ id: courseId!})
    )

    return (
        <div className="flex-1">
            <PageHeader>{course.data?.courseName}</PageHeader>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Course Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col">
                        <div className="text-muted foreground">
                            <p><b>Description:</b> `${course.data?.description}`</p>
                        </div>
                        <div>
                            <p><b>Enrollment Fee:</b> $`${course.data?.priceCents / 100}`</p>
                        </div>
                        <div>
                            <p><b>Credit Hours: </b> $`${course.data?.creditHours}`</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        
    )
}
