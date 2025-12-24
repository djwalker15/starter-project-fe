import { apiFetch } from "./http";

export type GreetingRead = {
  id: string; // uuid
  sender: string;
  recipient: string;
  message: string;
  created_at: string; // date-time
};

export type GreetingCreate = {
  sender: string;
  recipient: string;
  message: string;
};

export type GreetingUpdate = {
  sender?: string | null;
  recipient?: string | null;
  message?: string | null;
};

const BASE = "/api/v1/greetings";

export function listGreetings(signal?: AbortSignal) {
  return apiFetch<GreetingRead[]>(`${BASE}/`, { method: "GET", signal });
}

export function createGreeting(body: GreetingCreate, signal?: AbortSignal) {
  return apiFetch<GreetingRead>(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}

export function getGreeting(greetingId: string, signal?: AbortSignal) {
  return apiFetch<GreetingRead>(`${BASE}/${encodeURIComponent(greetingId)}`, {
    method: "GET",
    signal,
  });
}

export function updateGreeting(
  greetingId: string,
  body: GreetingUpdate,
  signal?: AbortSignal
) {
  return apiFetch<GreetingRead>(`${BASE}/${encodeURIComponent(greetingId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    signal,
  });
}

export function deleteGreeting(greetingId: string, signal?: AbortSignal) {
  // Your OpenAPI says delete returns an object (additionalProperties: true)
  return apiFetch<Record<string, unknown>>(
    `${BASE}/${encodeURIComponent(greetingId)}`,
    { method: "DELETE", signal }
  );
}
