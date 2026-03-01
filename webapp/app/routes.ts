import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/admin/layout.tsx", [
    route("admin/", "routes/admin/dashboard.tsx"),
    route("admin/trainees", "routes/admin/trainees.tsx"),
  ]),
  layout("routes/auth/layout.tsx", [
    route("login/", "routes/auth/login.tsx"),
    route("signup/", "routes/auth/signup.tsx"),
  ]),
] satisfies RouteConfig;
