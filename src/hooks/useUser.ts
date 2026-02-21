'use client';

import { useState, useEffect } from 'react';

interface UserState {
  user: null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useUser(): UserState {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Will connect to Supabase auth in Phase 3
    setIsLoading(false);
  }, []);

  return { user: null, isLoading, isAuthenticated: false };
}
