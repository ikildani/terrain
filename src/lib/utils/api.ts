import type { ApiResponse } from '@/types';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${res.status}`,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export function apiPost<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { method: 'GET' });
}

export function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { method: 'DELETE' });
}
