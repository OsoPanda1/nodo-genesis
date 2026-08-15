/* ================================================================== */
/* GAMIFICACIÓN — Repositorio durable (Postgres + Redis leaderboard)   */
/* ================================================================== */
/* Postgres = fuente de verdad de sesiones y ranking. Redis (si está   */
/* configurado) = sorted set del leaderboard para lecturas en tiempo   */
/* real entre instancias. Ambos son opcionales (degradación limpia).   */
/* ================================================================== */

import 'server-only';
import type { JSONValue } from 'postgres';
import { getRedis, isPostgresConfigured, nsKey, sql } from '@/lib/core/persistence';
import type { GamificationSession, LeaderboardEntry } from './contracts';

const LEADERBOARD_ZSET = nsKey('gamification', 'leaderboard');

export async function persistSession(session: GamificationSession): Promise<void> {
  if (!isPostgresConfigured()) return;
  const db = sql();
  await db`
    insert into public.gamification_sessions
      (id, device_id, started_at, ended_at, kills, total_points, data, updated_at)
    values (
      ${session.id}, ${session.deviceId}, ${session.startedAt}, ${session.endedAt ?? null},
      ${session.kills}, ${session.totalPoints}, ${db.json(session as unknown as JSONValue)}, now()
    )
    on conflict (id) do update set
      ended_at = excluded.ended_at,
      kills = excluded.kills,
      total_points = excluded.total_points,
      data = excluded.data,
      updated_at = now()
  `;
}

export async function persistLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
  if (isPostgresConfigured()) {
    const db = sql();
    await db`
      insert into public.gamification_leaderboard
        (device_id, display_name, points, kills, data, updated_at)
      values (
        ${entry.deviceId}, ${entry.name}, ${entry.points}, ${entry.captures},
        ${entry.deviceId}, ${entry.name}, ${entry.points}, ${entry.captures},
        ${db.json(entry as unknown as JSONValue)}, ${entry.updatedAt}
      )
      on conflict (device_id) do update set
        display_name = excluded.display_name,
        points = excluded.points,
        kills = excluded.kills,
        data = excluded.data,
        updated_at = excluded.updated_at
    `;
  }
  const redis = getRedis();
  if (redis) {
    await redis.zadd(LEADERBOARD_ZSET, { score: entry.points, member: entry.deviceId });
    await redis.hset(nsKey('gamification', 'entry', entry.deviceId), {
      id: entry.id,
      actorId: entry.actorId,
      deviceId: entry.deviceId,
      name: entry.name,
      points: entry.points,
      captures: entry.captures,
      updatedAt: entry.updatedAt,
    });
  }
}

export async function loadSessions(): Promise<GamificationSession[]> {
  if (!isPostgresConfigured()) return [];
  const db = sql();
  const rows = await db<Array<{ data: GamificationSession }>>`
    select data from public.gamification_sessions
    order by updated_at desc limit 5000
  `;
  return rows.map((r) => r.data);
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!isPostgresConfigured()) return [];
  const db = sql();
  const rows = await db<Array<{ data: LeaderboardEntry }>>`
    select data from public.gamification_leaderboard order by points desc limit 1000
  `;
  return rows.map((r) => r.data);
}
