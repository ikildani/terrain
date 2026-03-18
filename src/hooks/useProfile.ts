'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';

interface ProfileState {
  fullName: string | null;
  role: string | null;
  company: string | null;
  therapyAreas: string[];
  initials: string;
  isLoading: boolean;
  refresh: () => void;
}

export function useProfile(): ProfileState {
  const { user, isLoading: userLoading } = useUser();
  const [fullName, setFullName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [therapyAreas, setTherapyAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setFullName(null);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    async function fetchProfile() {
      const { data } = await supabase!
        .from('profiles')
        .select('full_name, role, company, therapy_areas')
        .eq('id', user!.id)
        .single();

      if (data?.full_name) {
        setFullName(data.full_name as string);
      }
      if (data?.role) {
        setRole(data.role as string);
      }
      if (data?.company) {
        setCompany(data.company as string);
      }
      if (data?.therapy_areas) {
        setTherapyAreas(data.therapy_areas as string[]);
      }
      setIsLoading(false);
    }

    fetchProfile();
  }, [user, userLoading, version]);

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user
      ? 'U'
      : 'T';

  return { fullName, role, company, therapyAreas, initials, isLoading: isLoading || userLoading, refresh };
}
