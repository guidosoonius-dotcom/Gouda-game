import { describe, expect, it } from "vitest";
import {
  CHOICES,
  ECHOES,
  EPILOGUE,
  OUTCOMES,
  applyChoice,
  applyOutcome,
  danglingEchoes,
  echoesFor,
  unreadChoiceValues,
} from "@/game/choices";
import { CHAPTERS } from "@/data/chapters";
import { satchelItems } from "@/data/satchel";

describe("choice system", () => {
  it("every option of every dilemma echoes in a later chapter", () => {
    expect(unreadChoiceValues()).toEqual([]);
  });

  it("echoes only reference flags and values that exist", () => {
    expect(danglingEchoes()).toEqual([]);
  });

  it("echoes never surface before their flag can be set", () => {
    for (const e of ECHOES) {
      const setIn = Number(e.when.flag.slice(2, 3));
      expect(e.chapter, e.id).toBeGreaterThan(setIn);
      expect(e.chapter, e.id).toBeLessThanOrEqual(EPILOGUE);
    }
  });

  it("choice ids are unique and belong to an existing chapter", () => {
    const ids = CHOICES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CHOICES) {
      expect(CHAPTERS.some((ch) => ch.id === c.chapter), c.id).toBe(true);
      expect(c.A.value).not.toBe(c.B.value);
    }
  });

  it("applyChoice stores the option value without mutating", () => {
    const before = {};
    const after = applyChoice(before, "ch1.pass", "A");
    expect(after).toEqual({ "ch1.pass": "student" });
    expect(before).toEqual({});
    expect(applyChoice(after, "ch1.pass", "B")["ch1.pass"]).toBe("glazen");
  });

  it("echoesFor returns exactly the echoes matching the flags", () => {
    const flags = applyOutcome(applyChoice({}, "ch1.pass", "B"), "ch1.task", "willem");
    expect(echoesFor(2, flags).map((e) => e.id).sort()).toEqual(["pass-glazen-key", "task-willem-tease"]);
    expect(echoesFor(2, flags, "route").map((e) => e.id)).toEqual(["pass-glazen-key"]);
    expect(echoesFor(4, flags)).toEqual([]);
    expect(echoesFor(4, applyChoice({}, "ch1.pass", "A")).map((e) => e.id)).toEqual(["pass-student-note"]);
  });

  it("every task outcome of a playable chapter changes that chapter's own story", () => {
    const ch1 = CHAPTERS[0].mirror!;
    const variants = new Set<string>();
    for (const task of OUTCOMES["ch1.task"]) {
      for (const pass of ["student", "glazen"]) {
        const story = ch1.story({ "ch1.task": task, "ch1.pass": pass });
        variants.add(story.headline + story.body);
      }
    }
    expect(variants.size).toBe(4);
  });

  it("every dilemma on a dossier page is a registered choice of that chapter", () => {
    for (const ch of CHAPTERS) {
      for (const page of ch.pages) {
        if (page.kind !== "dilemma") continue;
        expect(CHOICES.find((c) => c.id === page.choice)?.chapter).toBe(ch.id);
      }
    }
  });
});

describe("satchel", () => {
  it("is empty before the first chapter and fills from progress", () => {
    expect(satchelItems([], {})).toEqual([]);
    const kept = satchelItems([1], { "ch1.pass": "glazen" });
    expect(kept.map((i) => i.id)).toEqual(["krant-1", "bron-1", "pass"]);
    const gave = satchelItems([1], { "ch1.pass": "student" });
    expect(gave.map((i) => i.id)).toEqual(["krant-1", "bron-1"]);
  });

  it("labels invented objects as fiction", () => {
    const pass = satchelItems([1], { "ch1.pass": "glazen" }).find((i) => i.id === "pass")!;
    expect(pass.fiction).toBe(true);
  });
});
