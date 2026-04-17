import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";
import { redirect } from "react-router";

export default [
  index("routes/home.tsx"),
  route("admin", "routes/admin/layout.tsx", [
    index("routes/admin/dashboard.tsx"),
    route("trainees", "routes/admin/trainees.tsx"),
    route("instructors", "routes/admin/instructors.tsx"),
    route("users", "routes/admin/users.tsx"),
    route("*", "routes/admin/not-found.tsx"),
    route("course-manager", "routes/admin/courseManager.tsx"),
    route("course-details/:courseId", "routes/admin/courseDetails.tsx"),
  ]),
  route("trainee", "routes/trainee/layout.tsx", [
    index("routes/trainee/home.tsx"),
    route("signup", "routes/trainee/signup.tsx"),
    route("calendar", "routes/trainee/calendar.tsx"),
    route("certificates", "routes/trainee/certificates.tsx"),
    route("invoices", "routes/trainee/invoices.tsx"),
    route("*", "routes/trainee/not-found.tsx"),
  ]),
  route("instructor", "routes/instructor/layout.tsx", [
    index("routes/instructor/home.tsx"),
    route("attendance/:courseEventId", "routes/instructor/attendance.tsx"),
    route("*", "routes/instructor/not-found.tsx"),
  ]),
  layout("routes/auth/layout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("signup", "routes/auth/signup.tsx"),
    route("profile-selection", "routes/auth/profile-selection.tsx"),
  ]),
] satisfies RouteConfig;
