import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin/dashboard", "routes/admin/dashboard.tsx"),
  route("admin/course-manager", "routes/admin/courseManager.tsx"),
] satisfies RouteConfig;
