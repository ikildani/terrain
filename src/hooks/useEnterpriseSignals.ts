'use client';

import { useState, useEffect } from 'react';
import type { EnterpriseSignal } from '@/lib/enterprise-signals';

const CACHE_KEY_PREFIX = 'terrain_enterprise_signals:';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedSignal {
  data: EnterpriseSignal;
  cachedAt: number;
}

function getCached(workspaceId: string): EnterpriseSignal | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + workspaceId);
    if (!raw) return null;
    const cached: CachedSignal = JSON.parse(raw);
    if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY_PREFIX + workspaceId);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

function setCache(workspaceId: string, data: EnterpriseSignal): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CachedSignal = { data, cachedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY_PREFIX + workspaceId, JSON.stringify(entry));
  } catch {
    // sessionStorage may be unavailable
  }
}

interface UseEnterpriseSignalsResult {
  shouldNudge: boolean;
  reason: string | null;
  isLoading: boolean;
}

export function useEnterpriseSignals(workspaceId: string | null): UseEnterpriseSignalsResult {
  const [shouldNudge, setShouldNudge] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      setShouldNudge(false);
      setReason(null);
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cached = getCached(workspaceId);
    if (cached) {
      setShouldNudge(cached.shouldNudge);
      setReason(cached.reason);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSignals() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/enterprise-signals`);
        if (!res.ok || cancelled) {
          if (!cancelled) setIsLoading(false);
          return;
        }

        const json = await res.json();
        if (cancelled) return;

        if (json.success && json.data) {
          const signal: EnterpriseSignal = json.data;
          setShouldNudge(signal.shouldNudge);
          setReason(signal.reason);
          setCache(workspaceId!, signal);
        }
      } catch {
        // Silently fail — default to no nudge
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSignals();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return { shouldNudge, reason, isLoading };
}
