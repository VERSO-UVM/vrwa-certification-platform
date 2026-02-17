import { CourseManager } from "~/admin/courseManager";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Course Manager - VRWA Training Database" },
  ];
}

export default function () {
  return <CourseManager />
}
