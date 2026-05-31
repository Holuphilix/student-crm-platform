import { supabase } from "@/lib/supabase/supabase-client";
import { API_BASE_URL } from "@/lib/api/api-config";

const sessionWaitIntervals = [0, 100, 250, 500];

async function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function getAccessToken() {
  for (const interval of sessionWaitIntervals) {
    if (interval > 0) {
      await wait(interval);
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      return session.access_token;
    }
  }

  const {
    data: { session },
  } = await supabase.auth.refreshSession();

  return session?.access_token ?? null;
}

async function requestApi(
  endpoint: string,
  options: RequestInit,
  token: string | null
) {
  if (!token) {
    throw new Error(
      "Authentication session is not ready. Please sign in again."
    );
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${token}`,

      ...options.headers,
    },
  });
}

async function refreshAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.refreshSession();

  return session?.access_token ?? null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  let response = await requestApi(
    endpoint,
    options,
    token
  );

  if (response.status === 401) {
    response = await requestApi(
      endpoint,
      options,
      await refreshAccessToken()
    );
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message ??
        "API request failed."
    );
  }

  return result.data;
}
