"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { TUNING } from "@/game/tuning";
import { useGameStore } from "@/store/useGameStore";
import { ambience, sfx, unlockAudio } from "@/lib/sound";
import { Arrow } from "@/components/ui/icons";
import { CanalActors, type Fx } from "./CanalActors";
import { CanalHud, HUD_START, type HudState } from "./CanalHud";
import { CanalGuards } from "./CanalGuards";
import { CanalLife } from "./CanalLife";
import { CanalWorld } from "./CanalWorld";
import { COURSE, createSim, step, type Outcome, type Side, type Sim } from "./sim";

interface Input {
  strokes: Side[];
  held: Record<Side, number>;
}

const ENDINGS: Record<Outcome, { title: string; body: string }> = {
  stil: {
    title: "Niemand heeft jullie gezien",
    body: "De sluisdeur gaat op een kier. Marie knikt. Achter jullie zwaait het licht nog altijd over leeg water.",
  },
  gezien: {
    title: "Gezien, maar niet gepakt",
    body: "Een fluit, een schreeuw, en toen het riet. Jullie zijn er. Morgen weet de wacht dat hier iemand vaart.",
  },
  omweg: {
    title: "Marie kiest een andere weg",
    body: "‘Zo lukt het niet. Ik weet een sloot achterlangs.’ Het duurt een uur langer. Niemand vraagt waarom jullie nat zijn.",
  },
};

function clock(t: number) {
  const minutes = 19 * 60 + 45 + Math.floor(t / 10);
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Runs the simulation inside the render loop and reports to the DOM at 10 Hz. */
function Loop({ sim, fx, input, onHud, onEvent }: {
  sim: React.RefObject<Sim>;
  fx: React.RefObject<Fx>;
  input: React.RefObject<Input>;
  onHud: (h: HudState) => void;
  onEvent: (type: "caught" | "respawn" | "done", outcome?: Outcome) => void;
}) {
  const sinceHud = useRef(0);
  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    const now = performance.now();
    const { L, R } = input.current.held;
    const holdBoth = L > 0 && R > 0 && now - Math.max(L, R) > 220;
    for (const e of step(s, { strokes: input.current.strokes.splice(0), holdBoth }, dt)) {
      if (e.type === "stroke") {
        sfx.oar(e.masked ? 0.15 : 0.7);
        // Steering left means pulling the right oar, and the other way round.
        const oar: Side = e.side === "L" ? "R" : "L";
        fx.current.oar[oar] = s.t;
        const sx = (oar === "L" ? -1 : 1) * 1.7;
        fx.current.rings.push({
          x: s.x + Math.cos(s.heading) * sx,
          z: s.z + Math.sin(s.heading) * sx + 0.4,
          loud: e.masked ? 0.1 : 0.6,
        });
      } else if (e.type === "bump") sfx.settle();
      else if (e.type === "toll") sfx.bell();
      else if (e.type === "alert") sfx.reject();
      else if (e.type === "caught") (sfx.whistle(), onEvent("caught"));
      else if (e.type === "respawn") onEvent("respawn");
      else if (e.type === "done") (sfx.chime(), onEvent("done", e.outcome));
    }
    sinceHud.current += dt;
    if (sinceHud.current > 0.1) {
      sinceHud.current = 0;
      onHud({
        noise: s.noise,
        dist: s.z - COURSE.lockZ - 4,
        clock: clock(s.t),
        bellActive: s.bell.active,
        bellIn: Math.max(0, s.bell.next - s.t),
        hidden: s.hidden,
        lit: s.lit,
        exposure: s.exposure / TUNING.canal.exposureLimit,
        alerted: s.t < s.alertUntil,
        underBridge: s.underBridge,
        z: s.z,
        caught: s.caught,
      });
    }
  });
  return null;
}

export function CanalGame() {
  const { go, finishTask, advance } = useGameStore();
  const crew = useGameStore((s) => (s.flags["ch4.broer"] === "mee" ? 3 : 2));
  const sim = useRef<Sim>(createSim(crew));
  const fx = useRef<Fx>({ rings: [], oar: { L: -9, R: -9 } });
  const input = useRef<Input>({ strokes: [], held: { L: 0, R: 0 } });
  const [phase, setPhase] = useState<"intro" | "play" | "caught" | "done">("intro");
  const [hud, setHud] = useState<HudState>(HUD_START);
  const [outcome, setOutcome] = useState<Outcome>("stil");

  const down = useCallback((side: Side) => {
    input.current.held[side] = performance.now();
    input.current.strokes.push(side);
  }, []);
  const up = useCallback((side: Side) => {
    input.current.held[side] = 0;
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent, pressed: boolean) => {
      const side: Side | null = e.key === "ArrowLeft" ? "L" : e.key === "ArrowRight" ? "R" : null;
      if (!side || e.repeat) return;
      if (pressed) down(side);
      else up(side);
    };
    const kd = (e: KeyboardEvent) => key(e, true);
    const ku = (e: KeyboardEvent) => key(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => (window.removeEventListener("keydown", kd), window.removeEventListener("keyup", ku));
  }, [down, up]);

  useEffect(() => () => ambience.stop(), []);

  const start = () => {
    unlockAudio();
    sfx.paper();
    ambience.start();
    sim.current = createSim(crew);
    sim.current.status = "play";
    // Dev aid: /?z=-60 starts further down the canal (ignored in production builds).
    const z = process.env.NODE_ENV !== "production" ? Number(new URLSearchParams(window.location.search).get("z")) : 0;
    if (z < 0) Object.assign(sim.current, { z, graceUntil: 4, checkpoint: { x: 0, z, reed: -1 } });
    setHud(HUD_START);
    setPhase("play");
  };

  const onEvent = useCallback(
    (type: "caught" | "respawn" | "done", result?: Outcome) => {
      if (type === "caught") setPhase("caught");
      if (type === "respawn") setPhase("play");
      if (type === "done" && result) {
        setOutcome(result);
        finishTask("ch4.task", result);
        setPhase("done");
      }
    },
    [finishTask],
  );

  return (
    <div className="absolute inset-0 touch-none overflow-hidden bg-night">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 64, near: 0.5, far: 220, position: [0, 11.5, 13] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#0e1926"]} />
        <fogExp2 attach="fog" args={["#0e1926", 0.0115]} />
        <ambientLight color="#6a82a8" intensity={1.5} />
        <hemisphereLight args={["#7f9cc6", "#0b1016", 2.4]} />
        <directionalLight color="#b4c9ea" intensity={2.8} position={[-10, 24, 16]} />
        {/* fill from the other side, so the facades on both banks catch some moonlight */}
        <directionalLight color="#8fa9d2" intensity={1.5} position={[12, 12, 10]} />
        <CanalWorld />
        <CanalLife sim={sim} />
        <CanalGuards sim={sim} />
        <CanalActors sim={sim} fx={fx} />
        <Loop sim={sim} fx={fx} input={input} onHud={setHud} onEvent={onEvent} />
      </Canvas>

      {phase !== "intro" && phase !== "done" && <CanalHud hud={hud} onDown={down} onUp={up} />}

      <AnimatePresence>
        {phase === "caught" && (
          <motion.div
            key="caught"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(158,42,43,0) 30%, rgba(158,42,43,.6) 100%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-3">
              <span className="-rotate-6 border-[3px] border-alarm bg-night/70 px-4 py-1 font-stamp text-[34px] tracking-[0.2em] text-alarm">GEZIEN</span>
              <span className="font-fell text-[17px] italic text-parchment">
                {hud.caught >= TUNING.canal.maxCaught ? "‘Zo lukt het niet.’" : "Terug naar het laatste riet."}
              </span>
            </div>
          </motion.div>
        )}
        {(phase === "intro" || phase === "done") && (
          <motion.div
            key={phase}
            className="absolute inset-0 flex flex-col justify-end gap-5 bg-night/70 px-[22px] pb-[calc(26px+env(safe-area-inset-bottom))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col gap-2">
              <span className="label text-[10.5px] text-bone">{phase === "intro" ? "Oktober 1944 · 19:45" : "Bij de sluis"}</span>
              <h1 className="m-0 font-fell text-[32px] font-normal leading-[1.06] text-parchment">
                {phase === "intro" ? (
                  <>
                    Nachtvaart <span className="italic text-ochre">bij het Verlaat</span>
                  </>
                ) : (
                  ENDINGS[outcome].title
                )}
              </h1>
            </div>
            <div className="-rotate-1 bg-parchment px-5 py-4 text-ink shadow-[0_14px_30px_rgba(0,0,0,.55)]">
              {phase === "intro" ? (
                <ul className="m-0 flex list-none flex-col gap-2 p-0 font-type text-[14px] leading-[1.5]">
                  <li>Tik links en rechts om de beurt om te roeien.</li>
                  <li>Elke slag maakt lawaai. Wordt de meter rood, dan komt het licht naar je toe.</li>
                  <li>In het riet en onder de brug ben je onzichtbaar.</li>
                  <li>Slaat de Sint-Jan, dan hoort niemand je riemen.</li>
                  {crew === 3 && <li>Jaap roeit mee: zwaarder en luider, maar in de maat gaat het hard.</li>}
                </ul>
              ) : (
                <p className="m-0 font-news text-[16.5px] leading-[1.5]">{ENDINGS[outcome].body}</p>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={phase === "intro" ? start : () => (sfx.paper(), advance())} className="flex h-[54px] items-center justify-between bg-ochre px-[18px] font-label text-[14px] font-bold tracking-[0.17em] text-slate">
                {phase === "intro" ? "AFVAREN" : "LEES DE KRANT"}
                <Arrow color="#14181d" />
              </button>
              <button type="button" onClick={phase === "intro" ? () => go("dossier") : start} className="flex h-12 items-center justify-between border border-parchment/45 px-[18px] font-label text-[13px] font-bold tracking-[0.17em] text-parchment">
                {phase === "intro" ? "TERUG NAAR HET DOSSIER" : "NOG EEN KEER VAREN"}
                <Arrow color="#ede6d6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
