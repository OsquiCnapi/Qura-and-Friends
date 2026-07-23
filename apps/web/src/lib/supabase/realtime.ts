"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "./client.js";

export interface LeaderboardEntry {
  minigame_id: string;
  display_name: string;
  score: number;
}

/**
 * Suscripción EN VIVO al leaderboard de un minijuego. Cuando la Edge Function `submit-score` valida e
 * inserta una fila (replication ON en `scores`), este callback se dispara sin polling — el corazón del
 * requisito "todo en tiempo real con Supabase".
 */
export function subscribeLeaderboard(
  minigameId: string,
  onChange: () => void,
): { channel: RealtimeChannel; unsubscribe: () => void } {
  const supabase = createClient();
  const channel = supabase
    .channel(`leaderboard:${minigameId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "scores", filter: `minigame_id=eq.${minigameId}` },
      () => onChange(),
    )
    .subscribe();

  return {
    channel,
    unsubscribe: () => {
      void supabase.removeChannel(channel);
    },
  };
}
