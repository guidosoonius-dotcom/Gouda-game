/**
 * Hulpmodus: multiplies a few gameplay numbers of the minigames by the factors in `TUNING.assist`.
 * The simulations read `TUNING` while they run, so a change takes effect at once (a run's length
 * at its next start). `applyAssist(false)` restores the designed values exactly.
 */
import { TUNING } from "./tuning";

type Table = Record<string, Record<string, number>>;
const live = TUNING as unknown as Table;
const factors = TUNING.assist as unknown as Table;
const BASE: Table = Object.fromEntries(Object.keys(factors).map((game) => [game, { ...live[game] }]));

let on = false;
export const assistOn = () => on;

export function applyAssist(value: boolean) {
  on = value;
  for (const [game, table] of Object.entries(factors)) {
    for (const [key, f] of Object.entries(table)) live[game][key] = BASE[game][key] * (value ? f : 1);
  }
}
