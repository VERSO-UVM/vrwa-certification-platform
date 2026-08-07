import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("pages/home.tsx"),
  route("admin", "layouts/admin.tsx", [
    index("pages/admin/dashboard.tsx"),
    route("trainees", "pages/admin/trainee-manager.tsx"),
    route("instructors", "pages/admin/user-manager.tsx"),
    route("certifications", "pages/admin/certifications.tsx"),
    route("*", "pages/admin/not-found.tsx"),
    route("course-manager", "pages/admin/course-manager.tsx"),
    route(
      "course-details/:courseId",
      "pages/admin/course-manager/course-details.tsx",
    ),
  ]),
  route("trainee", "layouts/trainee.tsx", [
    index("pages/trainee/home.tsx"),
    route("certificates", "pages/trainee/certificates.tsx"),
    route("certificates/:courseEventId", "pages/trainee/view-certificate.tsx"),
    route("registration", "pages/trainee/registration.tsx"),
    route(
      "registration/:courseEventId",
      "pages/trainee/registration-details.tsx",
    ),
    route("*", "pages/trainee/not-found.tsx"),
  ]),
  route("instructor", "layouts/instructor.tsx", [
    index("pages/instructor/home/home.tsx"),
    route(
      "attendance/:courseEventId",
      "pages/instructor/attendance/attendance.tsx",
    ),
    route("*", "pages/instructor/not-found.tsx"),
  ]),
  layout("layouts/auth.tsx", [
    route("login", "pages/auth/login.tsx"),
    route("signup", "pages/auth/signup.tsx"),
    route("profile-select", "pages/auth/profile-selection.tsx"),
    route("profile-create", "pages/auth/create-profile.tsx"),
  ]),
] satisfies RouteConfig;
