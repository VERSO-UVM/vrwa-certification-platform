import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin", "layouts/admin.tsx", [
    index("admin/dashboard.tsx"),
    route("trainees", "admin/trainee-manager.tsx"),
    route("instructors", "./admin/user-manager.tsx"),
    route("*", "routes/admin/not-found.tsx"),
    route("course-manager", "./admin/course-manager.tsx"),
    route("course-details/:courseId", "./admin/course-details.tsx"),
  ]),
  route("trainee", "layouts/trainee.tsx", [
    index("trainee/home.tsx"),
    route("*", "routes/trainee/not-found.tsx"),
  ]),
  route("instructor", "layouts/instructor.tsx", [
    index("instructor/home.tsx"),
    route("*", "routes/instructor/not-found.tsx"),
  ]),
  layout("layouts/auth.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("signup", "routes/auth/signup.tsx"),
    route("profile-select", "routes/auth/profile-select.tsx"),
    route("profile-create", "routes/auth/profile-create.tsx"),
  ]),
] satisfies RouteConfig;
