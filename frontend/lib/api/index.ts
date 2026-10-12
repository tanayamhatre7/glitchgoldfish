import type { GenesisApi } from "@/types/genesis";
import { createHttpApi } from "./http";
export const isDemo = process.env.NEXT_PUBLIC_API_MODE === "mock";
let client: Promise<GenesisApi> | undefined;
export function getApi(): Promise<GenesisApi> {
  client ??= isDemo
    ? import("./mocks").then(({ createMockApi }) =>
        createMockApi(
          typeof window === "undefined" ? undefined : window.localStorage,
        ),
      )
    : Promise.resolve(
        createHttpApi(process.env.NEXT_PUBLIC_API_BASE_URL ?? ""),
      );
  return client;
}
