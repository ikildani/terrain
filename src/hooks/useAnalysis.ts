'use client';

import { useMutation } from '@tanstack/react-query';
import { apiPost } from '@/lib/utils/api';

interface AnalysisOptions<TInput, TOutput> {
  endpoint: string;
  onSuccess?: (data: TOutput, input: TInput) => void;
}

export function useAnalysis<TInput, TOutput>({ endpoint, onSuccess }: AnalysisOptions<TInput, TOutput>) {
  const mutation = useMutation({
    mutationFn: async (input: TInput) => {
      const res = await apiPost<TOutput>(endpoint, input);
      if (res.success && res.data) return { data: res.data, input };
      throw new Error(res.error ?? 'Analysis failed');
    },
    onSuccess: (result) => {
      onSuccess?.(result.data, result.input);
    },
  });

  return {
    analyze: mutation.mutateAsync,
    data: mutation.data?.data ?? null,
    input: mutation.data?.input ?? null,
    isLoading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    reset: mutation.reset,
  };
}
