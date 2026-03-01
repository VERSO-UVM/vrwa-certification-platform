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
] satisfies RouteConfig;
