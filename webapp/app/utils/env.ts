/// Environment information for the webapp to connect with the backend
/// or anything else.
///

export function getBackendUrl() {
  return import.meta.env.VITE_BACKEND || "http://localhost:3000";
}

export function getTrpcUrl() {
  return getBackendUrl() + "/trpc"
}
