import { CourseDetails } from "~/admin/courseDetails";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Course Details - VRWA Training Database" }];
}

export default function () {
  return <CourseDetails />;
}
