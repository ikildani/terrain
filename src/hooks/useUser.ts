'use client';

import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/client';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useUser(): UserState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial user
    async function getInitialUser() {
      const { data } = await supabase!.auth.getUser();
      const resolvedUser = data.user ?? null;
      setUser(resolvedUser);
      Sentry.setUser(resolvedUser ? { id: resolvedUser.id } : null);
      setIsLoading(false);
    }
    getInitialUser();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      Sentry.setUser(sessionUser ? { id: sessionUser.id } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading, isAuthenticated: !!user };
}
