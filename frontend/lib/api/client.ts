import { z } from "zod";
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export function validate<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    console.error("Validation error:", JSON.stringify(parsed.error.format(), null, 2));
    throw new ApiError(
      "The server returned an unexpected response. Please check the integration contract.",
    );
  }
  return parsed.data;
}
export function validateFile(file: File) {
  if (!/\.(pdf|docx|txt)$/i.test(file.name))
    throw new ApiError("Choose a PDF, DOCX or TXT file.");
  if (!file.size)
    throw new ApiError(
      "The selected file is empty. Choose a file with content.",
    );
}
export function createTransport(
  baseUrl: string,
  fetcher: typeof fetch = fetch,
  timeoutMs = 30000,
) {
  return async function request<T>(
    path: string,
    schema: z.ZodType<T>,
    options: RequestInit = {},
  ): Promise<T> {
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), timeoutMs);
    const signal = options.signal
      ? AbortSignal.any([options.signal, timeout.signal])
      : timeout.signal;
    try {
      if (!baseUrl)
        throw new ApiError(
          "Configure NEXT_PUBLIC_API_BASE_URL to connect to FastAPI.",
        );
      const response = await fetcher(`${baseUrl.replace(/\/$/, "")}${path}`, {
        ...options,
        signal,
      });
      if (!response.ok) {
        const messages: Record<number, string> = {
          400: "The request could not be accepted. Review your input.",
          401: "Authentication is required by the server.",
          403: "You do not have access to this project.",
          404: "This resource is not available yet.",
          409: "This action conflicts with the current project state. Refresh and try again.",
          413: "The file exceeds the server upload limit.",
          415: "The server does not support this file type.",
          422: "The server could not validate this input.",
          429: "Too many requests. Please try again shortly.",
        };
        throw new ApiError(
          messages[response.status] ??
            "The server could not complete this request. Please try again.",
          response.status,
        );
      }
      const data = response.status === 204 ? undefined : await response.json();
      return validate(schema, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (options.signal?.aborted) throw error;
      if (timeout.signal.aborted)
        throw new ApiError(
          "The request timed out. Refresh the project before retrying a write.",
        );
      if (error instanceof SyntaxError)
        throw new ApiError("The server returned an invalid response.");
      throw new ApiError(
        "Unable to reach Genesis. Check your connection and the API configuration.",
      );
    } finally {
      clearTimeout(timer);
    }
  };
}
