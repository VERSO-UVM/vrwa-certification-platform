import { useSearchParams } from "react-router";
type Value = string;

/**
 * useState but value is pulled and updated from the search params!
 */
export function useSearchParamEntry(
  key: string,
  init: Value,
): [value: Value, setValue: (val: Value) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? init;
  const setValue = (newValue: Value|null) => {
    setSearchParams((current) => {
      if (newValue == null) {
        current.delete(key);
      } else {
        current.set(key, newValue);
      }
      return current;
    });
  };
  return [value, setValue];
}
