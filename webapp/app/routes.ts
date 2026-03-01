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
    route("*", "routes/admin/not-found.tsx")
  ]),
  route("trainee", "routes/trainee/layout.tsx", [
    index("routes/trainee/home.tsx"),
    route("*", "routes/trainee/not-found.tsx")
  ]),
  layout("routes/auth/layout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("signup", "routes/auth/signup.tsx"),
  ]),
] satisfies RouteConfig;
