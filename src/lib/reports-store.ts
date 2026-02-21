import type { Report } from '@/types';

// In-memory store — will be replaced with Supabase later
export const reportsStore = new Map<string, Report>();
