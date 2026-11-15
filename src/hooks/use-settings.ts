import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";
import { DEFAULT_SETTINGS } from "@/lib/site";

export function useSettings() {
  const { data } = useQuery(settingsQuery);
  return data ?? DEFAULT_SETTINGS;
}
