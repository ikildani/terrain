'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
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
      toast.success('Analysis complete');
      onSuccess?.(result.data, result.input);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      if (message.includes('limit') || message.includes('usage')) {
        toast.error('Usage limit reached — upgrade to continue');
      } else {
        toast.error(message);
      }
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
