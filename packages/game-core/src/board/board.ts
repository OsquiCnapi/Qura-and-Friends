/**
 * Estado y transiciones del tablero por turnos (Mario Party). Lógica pura y serializable: se persiste
 * en Supabase (`board_sessions.board_state`) y se sincroniza por Realtime.
 */
import type { Rng } from "@quantum-party/quantum-engine";
import type { Tile } from "./tiles.js";
import { rollDie } from "./dice.js";

export interface BoardPawn {
  readonly slot: number;
  readonly tileIndex: number;
  readonly stars: number;
  readonly coins: number;
}

export interface BoardState {
  readonly tiles: Tile[];
  readonly pawns: BoardPawn[];
  readonly turn: number; // índice del jugador con el turno
  readonly round: number;
  readonly lastRoll: number | null;
  readonly phase: "idle" | "rolling" | "moving" | "tile-event" | "finished";
}

export function createBoardState(tiles: Tile[], numPawns: number): BoardState {
  return {
    tiles,
    pawns: Array.from({ length: numPawns }, (_, slot) => ({
      slot,
      tileIndex: 0,
      stars: 0,
      coins: 0,
    })),
    turn: 0,
    round: 1,
    lastRoll: null,
    phase: "idle",
  };
}

/** Tira el dado para el jugador en turno y mueve su peón (clamp al final del tablero). */
export function rollAndMove(state: BoardState, rng: Rng): BoardState {
  const roll = rollDie(rng);
  const pawns = state.pawns.map((p) =>
    p.slot === state.turn
      ? { ...p, tileIndex: Math.min(state.tiles.length - 1, p.tileIndex + roll) }
      : p,
  );
  return { ...state, pawns, lastRoll: roll, phase: "tile-event" };
}

/** La casilla donde cayó el jugador en turno (para que el host decida el evento). */
export function currentTile(state: BoardState): Tile {
  const pawn = state.pawns[state.turn];
  return state.tiles[pawn ? pawn.tileIndex : 0] as Tile;
}

/** Pasa el turno al siguiente jugador; incrementa la ronda al completar la vuelta. */
export function nextTurn(state: BoardState): BoardState {
  const turn = (state.turn + 1) % state.pawns.length;
  const round = turn === 0 ? state.round + 1 : state.round;
  const finished = state.pawns.some((p) => p.tileIndex >= state.tiles.length - 1);
  return { ...state, turn, round, lastRoll: null, phase: finished ? "finished" : "idle" };
}
