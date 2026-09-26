/**
 * Stopping and coming back.
 *
 * Twenty-eight situations is more than one sitting for an eight-year-old, and
 * until now closing the tab threw the whole village away. This saves the game
 * after every situation and offers to resume.
 *
 * What is saved is the *settled* game: the state, the village's name, and
 * which situation is next. Nothing half-done is kept — a child who closes the
 * tab in the middle of deciding comes back to that situation unanswered
 * rather than to a frozen half-choice, which is both simpler and kinder.
 *
 * Pure apart from the two functions that touch localStorage, so the shape of
 * a save can be tested without a browser.
 */

import type { GameState } from "./types";

const KEY = "first-rule:save";

/**
 * Bump when the shape changes in a way an old save can't satisfy. A save from
 * a previous version is dropped rather than migrated: the game is short, and
 * silently resuming into a half-valid village would be worse than starting
 * again.
 */
export const SAVE_VERSION = 1;

export interface SavedGame {
  version: number;
  state: GameState;
  villageName: string;
  /** Index into the chapters array, not the chapter number. */
  chapterIndex: number;
  /** Index of the next situation within that chapter. */
  index: number;
  /** Where the child was: an intro, a situation, the closing, the end. */
  phase: string;
  /** Milliseconds since the epoch, so the resume prompt can say "today". */
  savedAt: number;
}

export function makeSave(
  game: Omit<SavedGame, "version" | "savedAt">,
  now = Date.now(),
): SavedGame {
  return { version: SAVE_VERSION, savedAt: now, ...game };
}

/**
 * Is this parsed JSON a save this build can actually resume?
 *
 * Deliberately strict about the few fields the UI indexes with — a bad
 * chapterIndex would read past the end of the chapters array — and
 * deliberately incurious about the rest of GameState, which is the engine's
 * business and too large to re-validate field by field.
 */
export function isSave(value: unknown): value is SavedGame {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<SavedGame>;
  return (
    v.version === SAVE_VERSION &&
    typeof v.villageName === "string" &&
    typeof v.chapterIndex === "number" &&
    v.chapterIndex >= 0 &&
    typeof v.index === "number" &&
    v.index >= 0 &&
    typeof v.phase === "string" &&
    typeof v.savedAt === "number" &&
    Boolean(v.state) &&
    typeof v.state === "object" &&
    typeof (v.state as GameState).chapter === "number" &&
    Array.isArray((v.state as GameState).rules) &&
    Array.isArray((v.state as GameState).log)
  );
}

/** Reads a resumable save, or null. Never throws — storage can be blocked. */
export function loadGame(): SavedGame | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSave(parsed) ? parsed : null;
  } catch {
    // Private mode, blocked storage, or a corrupt save. Start fresh.
    return null;
  }
}

/** Writes the save. Failing to save must never interrupt play. */
export function saveGame(save: SavedGame): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Out of quota or storage blocked: the game continues, unsaved.
  }
  // Deliberately does not notify subscribers. The only reader is the resume
  // offer on the opening screen, which is behind us by the time anything is
  // saved; waking it on every situation would re-render the whole game for
  // nothing.
}

export function clearSave(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to do — if it can't be removed it couldn't have been written.
  }
  for (const listener of listeners) listener();
}

/* ---- reading the save as an external store ---- */

// localStorage is an external store, so React reads it through
// useSyncExternalStore rather than an effect copying it into state. That also
// gets hydration right for free: the server snapshot is always null, and the
// client re-renders with the real save once it has hydrated.

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSave: SavedGame | null = null;

export function subscribeSave(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * The saved game, with a stable identity between reads — React requires the
 * snapshot not to change unless the store did, and re-parsing every render
 * would hand back a new object each time and loop.
 */
export function getSaveSnapshot(): SavedGame | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cachedRaw) return cachedSave;
  cachedRaw = raw;
  cachedSave = loadGame();
  return cachedSave;
}

export function getServerSaveSnapshot(): SavedGame | null {
  return null;
}
