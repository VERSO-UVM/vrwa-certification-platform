import type { Route } from "../+types/home";
import { TraineeManager } from "~/admin/trainees";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin - Trainee Manager" }];
}

export default function () {
  return <TraineeManager />;
}
