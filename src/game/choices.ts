/**
 * Choice system: every dilemma sets a flag, every flag echoes in a later chapter.
 * Pure data + pure functions, so it is trivially testable (tests/choices.test.ts).
 */
export type Flags = Record<string, string>;

export interface ChoiceOption {
  value: string;
  title: string;
  sub: string;
}

export interface ChoiceDef {
  id: string;
  chapter: number;
  question: string;
  /** Second half of the question, set in italics/ochre. */
  questionAccent: string;
  A: ChoiceOption;
  B: ChoiceOption;
}

export const EPILOGUE = 6;

export const CHOICES = [
  {
    id: "ch1.pass",
    chapter: 1,
    question: "Geef je hem",
    questionAccent: "het doorgangsbewijs?",
    A: {
      value: "student",
      title: "Geef het aan de student",
      sub: "Hij haalt de kust misschien. De glazen reizen zonder papier.",
    },
    B: {
      value: "glazen",
      title: "Bewaar het voor de glazen",
      sub: "De kisten kunnen weg. Hij moet het zonder doen.",
    },
  },
  {
    id: "ch2.kees",
    chapter: 2,
    question: "Neem je Kees mee",
    questionAccent: "over de daken?",
    A: { value: "mee", title: "Kees gaat mee", sub: "Hij ziet patrouilles eerder. Hij is veertien." },
    B: { value: "alleen", title: "Ik ga alleen", sub: "Veiliger voor hem. Hendrik kijkt je niet aan." },
  },
  {
    id: "ch4.broer",
    chapter: 4,
    question: "Mag Jaap",
    questionAccent: "mee in de boot?",
    A: { value: "mee", title: "Hij vaart mee", sub: "Zwaarder en luider. Wel een tweede roeier." },
    B: { value: "achter", title: "Hij blijft achter", sub: "De boot blijft stil. Hij moet zelf een adres vinden." },
  },
  {
    id: "ch5.puin",
    chapter: 5,
    question: "Waar ga jij",
    questionAccent: "heen?",
    A: { value: "zoeken", title: "Ik help de man zoeken", sub: "Gerrit brengt de groep alleen. Het duurt langer." },
    B: { value: "groep", title: "Ik breng de groep eerst", sub: "Zes mensen veilig. De man blijft achter." },
  },
] as const satisfies readonly ChoiceDef[];

export type ChoiceId = (typeof CHOICES)[number]["id"];

/** Outcomes of tasks/minigames. Failing never blocks progress; it changes the story. */
export const OUTCOMES = {
  "ch1.task": ["alleen", "willem"],
  "ch4.task": ["stil", "gezien", "omweg"],
  // Appended, not inserted: the recovery code stores outcomes in this order.
  "ch2.task": ["ongezien", "gezien", "telaat"],
} as const;
export type OutcomeId = keyof typeof OUTCOMES;

export type EchoSlot = "scene" | "satchel" | "cast" | "route" | "epilogue";

export interface Echo {
  id: string;
  /** Chapter in which the echo surfaces (6 = epilogue). */
  chapter: number;
  slot: EchoSlot;
  when: { flag: string; is: string };
  text: string;
}

export const ECHOES: readonly Echo[] = [
  {
    id: "pass-student-note",
    chapter: 4,
    slot: "satchel",
    when: { flag: "ch1.pass", is: "student" },
    text: "Via de lijn komt een briefje zonder afzender: ‘De fiets heeft de kust gehaald.’",
  },
  {
    id: "pass-glazen-marie",
    chapter: 4,
    slot: "scene",
    when: { flag: "ch1.pass", is: "glazen" },
    text: "Marie kent je van de kisten in de Sint-Jan. ‘Jij bent die van het glas. Jou vertrouw ik.’",
  },
  {
    id: "pass-glazen-key",
    chapter: 2,
    slot: "route",
    when: { flag: "ch1.pass", is: "glazen" },
    text: "Willem heeft de sleutel van de kerkzolder voor je geregeld. Je begint hoger dan de patrouille kijkt.",
  },
  {
    id: "task-willem-tease",
    chapter: 2,
    slot: "scene",
    when: { flag: "ch1.task", is: "willem" },
    text: "‘Deze keer til je zelf,’ zegt Willem, en hij knipoogt.",
  },
  {
    id: "task-alleen-trust",
    chapter: 2,
    slot: "scene",
    when: { flag: "ch1.task", is: "alleen" },
    text: "‘Wie glas kan pakken, kan ook een boodschap dragen,’ zegt Willem.",
  },
  {
    id: "kees-mee-courier",
    chapter: 5,
    slot: "cast",
    when: { flag: "ch2.kees", is: "mee" },
    text: "Kees is zestien nu. Hij fietst naast je, een koerierstas over zijn schouder.",
  },
  {
    id: "kees-alleen-distant",
    chapter: 5,
    slot: "cast",
    when: { flag: "ch2.kees", is: "alleen" },
    text: "Kees kijkt je nauwelijks aan. Toch is hij de eerste die de verbandkist pakt.",
  },
  {
    id: "broer-mee-square",
    chapter: EPILOGUE,
    slot: "epilogue",
    when: { flag: "ch4.broer", is: "mee" },
    text: "Naast Marie staat haar broer, magerder, met een geleende jas.",
  },
  {
    id: "broer-achter-silence",
    chapter: EPILOGUE,
    slot: "epilogue",
    when: { flag: "ch4.broer", is: "achter" },
    text: "Marie staat alleen op de Markt. Over haar broer zegt ze niets.",
  },
  {
    id: "puin-zoeken-letter",
    chapter: EPILOGUE,
    slot: "epilogue",
    when: { flag: "ch5.puin", is: "zoeken" },
    text: "Een man drukt je hand en laat hem lang niet los.",
  },
  {
    id: "puin-groep-faces",
    chapter: EPILOGUE,
    slot: "epilogue",
    when: { flag: "ch5.puin", is: "groep" },
    text: "Zes gezichten uit de kelder knikken naar je. Eén man kijkt weg.",
  },
];

export function choiceById(id: string): ChoiceDef | undefined {
  return CHOICES.find((c) => c.id === id);
}

/** Pure reducer: returns new flags with the chosen option's value stored. */
export function applyChoice(flags: Flags, id: ChoiceId, option: "A" | "B"): Flags {
  const def = choiceById(id);
  if (!def) throw new Error(`Unknown choice: ${id}`);
  return { ...flags, [id]: def[option].value };
}

export function applyOutcome<K extends OutcomeId>(
  flags: Flags,
  id: K,
  value: (typeof OUTCOMES)[K][number],
): Flags {
  return { ...flags, [id]: value };
}

/** Echoes that surface in `chapter` for the given flags, optionally for one slot. */
export function echoesFor(chapter: number, flags: Flags, slot?: EchoSlot): Echo[] {
  return ECHOES.filter(
    (e) =>
      e.chapter === chapter && flags[e.when.flag] === e.when.is && (slot === undefined || e.slot === slot),
  );
}

/** Design check: every option of every choice must be read by an echo in a later chapter. */
export function unreadChoiceValues(): string[] {
  const missing: string[] = [];
  for (const c of CHOICES) {
    for (const key of ["A", "B"] as const) {
      const value = c[key].value;
      const read = ECHOES.some(
        (e) => e.when.flag === c.id && e.when.is === value && e.chapter > c.chapter,
      );
      if (!read) missing.push(`${c.id}=${value}`);
    }
  }
  return missing;
}

/** Design check: echoes must only reference flags and values that exist. */
export function danglingEchoes(): string[] {
  const known = new Map<string, readonly string[]>();
  for (const c of CHOICES) known.set(c.id, [c.A.value, c.B.value]);
  for (const [id, values] of Object.entries(OUTCOMES)) known.set(id, values);
  return ECHOES.filter((e) => !known.get(e.when.flag)?.includes(e.when.is)).map((e) => e.id);
}
