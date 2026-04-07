import { useLocation, useNavigate } from "react-router";

/**
 * useState<string> but value is pulled and updated from the hash string!
 */
export function useHashString(
  init: string | null,
): [string | null, (val: string | null) => void] {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const value =
    hash && hash.startsWith("#") && hash.length > 1 ? hash.slice(1) : init;
  const setValue = (newValue: string | null) => {
    navigate({
      hash: newValue ? `#${newValue}` : "",
    });
  };
  return [value, setValue];
}
