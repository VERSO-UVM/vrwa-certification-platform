import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin", "layouts/admin.tsx", [
    index("routes/admin/dashboard.tsx"),
    route("trainees", "routes/admin/trainees.tsx"),
    route("instructors", "routes/admin/instructors.tsx"),
    route("*", "routes/admin/not-found.tsx"),
    route("course-manager", "routes/admin/courseManager.tsx"),
    route("course-details/:courseId", "routes/admin/courseDetails.tsx"),
  ]),
  route("trainee", "layouts/trainee.tsx", [
    index("routes/trainee/home.tsx"),
    route("*", "routes/trainee/not-found.tsx"),
  ]),
  route("instructor", "layouts/instructor.tsx", [
    index("instructor/home.tsx"),
    route("instructor/:courseEventId", "instructor/attendance.tsx"),
    route("*", "routes/instructor/not-found.tsx"),
  ]),
  layout("layouts/auth.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("signup", "routes/auth/signup.tsx"),
    route("profile-select", "routes/auth/profile-select.tsx"),
    route("profile-create", "routes/auth/profile-create.tsx"),
  ]),
] satisfies RouteConfig;
