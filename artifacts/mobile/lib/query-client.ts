import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

let baseUrl = "";

export function setBaseUrl(url: string) {
  baseUrl = url.endsWith("/") ? url : url + "/";
}

export function getApiUrl(): string {
  return baseUrl;
}
