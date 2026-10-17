import { ApiError } from "@/services/api-error";
import type { ApiProblemDetails } from "@/types/api";
import { readAuthSession } from "@/features/auth/api/auth-storage";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5067"
).replace(/\/+$/, "");

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const error = payload as ApiProblemDetails;

    if (error.detail) return error.detail;
    if (error.title) return error.title;

    if (error.errors) {
      const firstError = Object.values(error.errors).flat().find(Boolean);

      if (firstError) return firstError;
    }
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, body, headers: customHeaders, ...requestOptions } = options;

  const headers = new Headers(customHeaders);
  headers.set("Accept", "application/json");

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = token ?? readAuthSession()?.accessToken;

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
      {
        ...requestOptions,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;

    throw new ApiError(
      "Unable to connect to the API. Check that the backend is running and accessible.",
      0,
      error,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  let payload: unknown;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        payload,
        `API request failed with status ${response.status}.`,
      ),
      response.status,
      payload,
    );
  }

  return payload as T;
}
