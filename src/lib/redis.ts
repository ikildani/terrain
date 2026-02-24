/**
 * Shared Upstash Redis client.
 * Used by rate-limit, analysis caching, and other server-side features.
 * Returns null when Redis env vars are missing (dev/test fallback).
 */

import { Redis } from '@upstash/redis';

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis: Redis | null = REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

export const isRedisAvailable = !!redis;
