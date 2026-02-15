import { useAuth } from "@clerk/clerk-react";

/**
 * Custom fetch wrapper that automatically includes Clerk auth token
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<Response> {
  const token = await getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Hook to get fetchWithAuth bound to current user's token
 */
export function useFetchWithAuth() {
  const { getToken } = useAuth();

  return async (url: string, options: RequestInit = {}) => {
    return fetchWithAuth(url, options, getToken);
  };
}
