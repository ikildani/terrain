'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './useUser';
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/types';

const STORAGE_KEY = 'terrain_active_workspace';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  members: WorkspaceMember[];
  myRole: WorkspaceRole | null;
  isLoading: boolean;
  setActiveWorkspace: (id: string) => void;
  refetch: () => void;
}

function getStoredWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeWorkspaceId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage may be unavailable (private browsing, full storage)
  }
}

export function useWorkspace(): WorkspaceState {
  const { user, isLoading: userLoading } = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(getStoredWorkspaceId);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchCounterRef = useRef(0);

  // ── Fetch workspaces list ──────────────────────────────────
  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspaceId(null);
      storeWorkspaceId(null);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    const counter = ++fetchCounterRef.current;
    setIsLoading(true);

    try {
      const res = await fetch('/api/workspaces');
      if (!res.ok) {
        setWorkspaces([]);
        setIsLoading(false);
        return;
      }

      const json = (await res.json()) as { success: boolean; data?: Workspace[] };
      if (!json.success || !json.data) {
        setWorkspaces([]);
        setIsLoading(false);
        return;
      }

      // Stale guard — ignore if a newer fetch was initiated
      if (counter !== fetchCounterRef.current) return;

      const fetched = json.data;
      setWorkspaces(fetched);

      // Auto-select: prefer stored ID if it still exists, otherwise first workspace
      const storedId = getStoredWorkspaceId();
      const storedStillValid = storedId && fetched.some((ws) => ws.id === storedId);

      if (storedStillValid) {
        setActiveWorkspaceId(storedId);
      } else if (fetched.length > 0) {
        const firstId = fetched[0].id;
        setActiveWorkspaceId(firstId);
        storeWorkspaceId(firstId);
      } else {
        setActiveWorkspaceId(null);
        storeWorkspaceId(null);
      }
    } catch {
      setWorkspaces([]);
    } finally {
      if (counter === fetchCounterRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  // Fetch workspaces when user changes
  useEffect(() => {
    if (userLoading) return;
    fetchWorkspaces();
  }, [userLoading, fetchWorkspaces]);

  // ── Fetch members when activeWorkspaceId changes ───────────
  useEffect(() => {
    if (!activeWorkspaceId || !user) {
      setMembers([]);
      return;
    }

    let cancelled = false;

    async function fetchMembers() {
      try {
        const res = await fetch(`/api/workspaces/${activeWorkspaceId}`);
        if (!res.ok || cancelled) {
          if (!cancelled) setMembers([]);
          return;
        }

        const json = (await res.json()) as {
          success: boolean;
          data?: Workspace & { members: WorkspaceMember[] };
        };

        if (cancelled) return;

        if (json.success && json.data?.members) {
          setMembers(json.data.members);
        } else {
          setMembers([]);
        }
      } catch {
        if (!cancelled) setMembers([]);
      }
    }

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspaceId, user]);

  // ── Switch workspace ───────────────────────────────────────
  const setActiveWorkspace = useCallback(
    (id: string) => {
      const exists = workspaces.some((ws) => ws.id === id);
      if (!exists) return;
      setActiveWorkspaceId(id);
      storeWorkspaceId(id);
    },
    [workspaces],
  );

  // ── Derived values ─────────────────────────────────────────
  const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId) ?? null;

  const myRole: WorkspaceRole | null = user ? (members.find((m) => m.user_id === user.id)?.role ?? null) : null;

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    members,
    myRole,
    isLoading: isLoading || userLoading,
    setActiveWorkspace,
    refetch: fetchWorkspaces,
  };
}
