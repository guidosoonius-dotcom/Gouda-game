"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { TUNING } from "@/game/tuning";
import { useGameStore } from "@/store/useGameStore";
import { ambience, sfx, unlockAudio } from "@/lib/sound";
import { Arrow } from "@/components/ui/icons";
import { RoofActors } from "./RoofActors";
import { RoofHud, ROOF_HUD_START, type RoofHudState } from "./RoofHud";
import { RoofWorld } from "./RoofWorld";
import { Cinema, Night } from "@/components/canal/Night";
import { ridgeAt } from "./layout";
import { ROOF, createRoof, dashIsSafe, stepRoof, type RoofOutcome, type RoofSim } from "./sim";

interface Input {
  tap: boolean;
  downAt: number;
}

const ENDINGS: Record<RoofOutcome, { title: string; body: string }> = {
  ongezien: { title: "Niemand keek omhoog", body: "Je tikt op het dakraam. Hendrik kijkt op van de pers en begrijpt het meteen." },
  gezien: { title: "Gezien, maar op tijd", body: "Beneden klinkt een fluit. Je laat je door het dakraam zakken. ‘Controle,’ zeg je. Meer is niet nodig." },
  telaat: { title: "De klok slaat acht", body: "Te laat voor de daken. Je neemt de steeg en bonst op de achterdeur, terwijl aan de voorkant al wordt aangebeld." },
};

function Loop({ sim, input, onHud, onEvent }: {
  sim: React.RefObject<RoofSim>;
  input: React.RefObject<Input>;
  onHud: (h: RoofHudState) => void;
  onEvent: (type: "caught" | "respawn" | "done", outcome?: RoofOutcome) => void;
}) {
  const since = useRef(0);
  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    const hold = input.current.downAt > 0 && performance.now() - input.current.downAt > 170;
    const tap = input.current.tap;
    input.current.tap = false;
    for (const e of stepRoof(s, { tap, hold }, dt)) {
      if (e.type === "arrive") sfx.settle();
      else if (e.type === "caught") (sfx.whistle(), onEvent("caught"));
      else if (e.type === "respawn") onEvent("respawn");
      else if (e.type === "done") ((e.outcome === "telaat" ? sfx.bell : sfx.chime)(), onEvent("done", e.outcome));
    }
    since.current += dt;
    if (since.current > 0.1) {
      since.current = 0;
      onHud({
        timeLeft: s.timeLeft, cover: s.cover, moving: s.moving, flat: s.flat, lit: s.lit,
        exposure: s.exposure / TUNING.rooftop.exposureLimit, kees: s.kees, safe: !s.moving && dashIsSafe(s), caught: s.caught,
      });
    }
  });
  return null;
}

export function RoofGame() {
  const { go, finishTask, advance } = useGameStore();
  const kees = useGameStore((s) => s.flags["ch2.kees"] === "mee");
  // Willem's key to the church attic (chapter 1): you start two roofs further.
  const startCover = useGameStore((s) => (s.flags["ch1.pass"] === "glazen" ? 2 : 0));
  const sim = useRef<RoofSim>(createRoof(kees, startCover));
  const input = useRef<Input>({ tap: false, downAt: 0 });
  const [phase, setPhase] = useState<"intro" | "play" | "caught" | "done">("intro");
  const [hud, setHud] = useState<RoofHudState>(ROOF_HUD_START);
  const [outcome, setOutcome] = useState<RoofOutcome>("ongezien");

  const down = useCallback(() => {
    input.current.tap = true;
    input.current.downAt = performance.now();
  }, []);
  const up = useCallback(() => void (input.current.downAt = 0), []);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => e.code === "Space" && !e.repeat && down();
    const ku = (e: KeyboardEvent) => e.code === "Space" && up();
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => (window.removeEventListener("keydown", kd), window.removeEventListener("keyup", ku), ambience.stop());
  }, [down, up]);

  const start = () => {
    unlockAudio();
    sfx.paper();
    ambience.start();
    sim.current = createRoof(kees, startCover);
    sim.current.status = "play";
    // Dev aid: /?cover=7 starts further along the roofs (ignored in production builds).
    const c = process.env.NODE_ENV !== "production" ? Number(new URLSearchParams(window.location.search).get("cover")) : 0;
    if (c > 0 && c < ROOF.covers.length - 1) Object.assign(sim.current, { cover: c, x: ROOF.covers[c] });
    setHud({ ...ROOF_HUD_START, kees });
    setPhase("play");
  };

  const onEvent = useCallback(
    (type: "caught" | "respawn" | "done", result?: RoofOutcome) => {
      if (type === "caught") setPhase("caught");
      if (type === "respawn") setPhase("play");
      if (type === "done" && result) {
        setOutcome(result);
        finishTask("ch2.task", result);
        setPhase("done");
      }
    },
    [finishTask],
  );

  const x0 = ROOF.covers[startCover];
  return (
    <div className="absolute inset-0 touch-none overflow-hidden bg-night">
      <Canvas shadows="soft" dpr={[1, 2]} style={{ filter: "contrast(1.07) saturate(1.1)" }} camera={{ fov: 58, near: 0.5, far: 420, position: [x0 - 12, ridgeAt(x0) + 5.2, 4.2] }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#0e1a2a"]} />
        <fogExp2 attach="fog" args={["#0e1a2a", 0.0085]} />
        <Night moon={[-9, 24, -15]} focus={(out) => out.set(sim.current.x + 9, ridgeAt(sim.current.x), 0)} subject={(out) => out.set(sim.current.x - 0.6, ridgeAt(sim.current.x), 1.6)} extent={34} />
        <RoofWorld sim={sim} />
        <RoofActors sim={sim} />
        <Loop sim={sim} input={input} onHud={setHud} onEvent={onEvent} />
      </Canvas>

      <Cinema />
      {(phase === "play" || phase === "caught") && <RoofHud hud={hud} onDown={down} onUp={up} />}

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
                {hud.caught >= TUNING.rooftop.maxCaught ? "De daken zijn niet meer veilig." : "Terug achter de schoorsteen."}
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
              <span className="label text-[10.5px] text-bone">{phase === "intro" ? "November 1942 · 19:52" : "Bij het dakraam"}</span>
              <h1 className="m-0 font-fell text-[32px] font-normal leading-[1.06] text-parchment">
                {phase === "intro" ? (
                  <>
                    Over <span className="italic text-ochre">de daken</span>
                  </>
                ) : (
                  ENDINGS[outcome].title
                )}
              </h1>
            </div>
            <div className="-rotate-1 bg-parchment px-5 py-4 text-ink shadow-[0_14px_30px_rgba(0,0,0,.55)]">
              {phase === "intro" ? (
                <ul className="m-0 flex list-none flex-col gap-2 p-0 font-type text-[14px] leading-[1.5]">
                  <li>Tik om naar de volgende schoorsteen te rennen.</li>
                  <li>Achter een schoorsteen ziet niemand je. Wacht tot het zoeklicht weg is.</li>
                  <li>Komt het licht toch: houd vast en ga plat op de pannen liggen.</li>
                  <li>Om acht uur begint de spertijd. Dan moet Hendrik gewaarschuwd zijn.</li>
                  {kees && <li>Kees loopt achter je aan en fluistert wanneer het veilig is.</li>}
                  {startCover > 0 && <li>Willems sleutel van de kerkzolder: je begint twee daken verder.</li>}
                </ul>
              ) : (
                <p className="m-0 font-news text-[16.5px] leading-[1.5]">{ENDINGS[outcome].body}</p>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={phase === "intro" ? start : () => (sfx.paper(), advance())} className="flex h-[54px] items-center justify-between bg-ochre px-[18px] font-label text-[14px] font-bold tracking-[0.17em] text-slate">
                {phase === "intro" ? "HET DAK OP" : "LEES DE KRANT"}
                <Arrow color="#14181d" />
              </button>
              <button type="button" onClick={phase === "intro" ? () => go("dossier") : start} className="flex h-12 items-center justify-between border border-parchment/45 px-[18px] font-label text-[13px] font-bold tracking-[0.17em] text-parchment">
                {phase === "intro" ? "TERUG NAAR HET DOSSIER" : "NOG EEN KEER"}
                <Arrow color="#ede6d6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
