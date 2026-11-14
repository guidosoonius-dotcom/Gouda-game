"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { TUNING } from "@/game/tuning";
import { echoesFor } from "@/game/choices";
import { useGameStore } from "@/store/useGameStore";
import { ambience, sfx, unlockAudio } from "@/lib/sound";
import { Arrow } from "@/components/ui/icons";
import { Cinema, Night } from "@/components/canal/Night";
import { Dilemma } from "@/components/dossier/Dilemma";
import { BikeActors } from "./BikeActors";
import { BikeHud, BIKE_HUD_START, type BikeHudState } from "./BikeHud";
import { BikeWorld } from "./BikeWorld";
import { STREET, createBike, peopleSafe, resolveDilemma, stepBike, type BikeOutcome, type BikeSim } from "./sim";

interface Input {
  L: boolean;
  R: boolean;
  bell: boolean;
}

const ENDINGS: Record<BikeOutcome, { title: string; body: string }> = {
  allen: { title: "Iedereen is binnen", body: "De kelderdeur valt dicht. Iemand begint te tellen, en komt uit. Boven jullie wordt het langzaam stil." },
  enkelen: { title: "Niet iedereen heeft je gehoord", body: "De kelder is vol, maar er ontbreken gezichten. Gerrit pakt zijn helm en gaat de rook weer in." },
  telaat: { title: "Het wordt stil boven het spoor", body: "De aanval is voorbij voordat je er bent. Gerrit heeft de laatsten zelf naar binnen gebracht. Je hebt gedaan wat je kon." },
};

function Loop({ sim, input, shake, onHud, onEvent }: {
  sim: React.RefObject<BikeSim>;
  input: React.RefObject<Input>;
  shake: React.RefObject<number>;
  onHud: (h: BikeHudState) => void;
  onEvent: (type: "dilemma" | "done", outcome?: BikeOutcome) => void;
}) {
  const since = useRef(0);
  useFrame((_, delta) => {
    const s = sim.current;
    const dt = Math.min(delta, 0.05);
    const bell = input.current.bell;
    input.current.bell = false;
    for (const e of stepBike(s, { left: input.current.L, right: input.current.R, bell }, dt)) {
      if (e.type === "bell") sfx.ring();
      else if (e.type === "join") sfx.chime();
      else if (e.type === "bump") sfx.settle();
      else if (e.type === "whistle") sfx.fall();
      else if (e.type === "impact") (sfx.rumble(), (shake.current = 1));
      else if (e.type === "scatter") sfx.reject();
      else if (e.type === "dilemma") onEvent("dilemma");
      else if (e.type === "done") onEvent("done", e.outcome);
    }
    since.current += dt;
    if (since.current > 0.1) {
      since.current = 0;
      const goal = s.choice === "zoeken" ? STREET.ruin.z : STREET.shelterZ;
      onHud({
        timeLeft: s.timeLeft,
        safe: peopleSafe(s),
        behind: s.groups.reduce((n, g, i) => n + (g.state === "following" ? STREET.groups[i].n : 0), 0),
        warning: s.bombs.some((b) => Math.hypot(b.x - s.x, b.z - s.z) < TUNING.bike.bombRadius + 6),
        near: s.groups.some((g) => (g.state === "waiting" || g.state === "scared") && Math.hypot(g.x - s.x, g.z - s.z) < TUNING.bike.bellRange),
        searching: s.choice === "zoeken",
        dist: s.z - goal,
      });
    }
  });
  return null;
}

export function BikeGame() {
  const { go, finishTask, advance, decide } = useGameStore();
  const flags = useGameStore((s) => s.flags);
  const kees = flags["ch2.kees"] === "mee";
  const cast = echoesFor(5, flags, "cast")[0]?.text;
  const sim = useRef<BikeSim>(createBike());
  const input = useRef<Input>({ L: false, R: false, bell: false });
  const shake = useRef(0);
  const [phase, setPhase] = useState<"intro" | "play" | "dilemma" | "done">("intro");
  const [hud, setHud] = useState<BikeHudState>(BIKE_HUD_START);
  const [outcome, setOutcome] = useState<BikeOutcome>("allen");

  const steer = useCallback((side: "L" | "R", down: boolean) => void (input.current[side] = down), []);
  const bell = useCallback(() => void (input.current.bell = true), []);

  useEffect(() => {
    const key = (e: KeyboardEvent, down: boolean) => {
      if (e.key === "ArrowLeft") steer("L", down);
      if (e.key === "ArrowRight") steer("R", down);
      if (e.code === "Space" && down && !e.repeat) bell();
    };
    const kd = (e: KeyboardEvent) => key(e, true);
    const ku = (e: KeyboardEvent) => key(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => (window.removeEventListener("keydown", kd), window.removeEventListener("keyup", ku), ambience.stop());
  }, [steer, bell]);

  const start = () => {
    unlockAudio();
    sfx.paper();
    ambience.start();
    sim.current = createBike();
    sim.current.status = "play";
    // Dev aid: /?z=-60 starts further down the street (ignored in production builds).
    const z = process.env.NODE_ENV !== "production" ? Number(new URLSearchParams(window.location.search).get("z")) : 0;
    if (z < 0) sim.current.z = z;
    input.current = { L: false, R: false, bell: false };
    setHud(BIKE_HUD_START);
    setPhase("play");
  };

  const onEvent = useCallback(
    (type: "dilemma" | "done", result?: BikeOutcome) => {
      if (type === "dilemma") setPhase("dilemma");
      if (type === "done" && result) {
        setOutcome(result);
        finishTask("ch5.task", result);
        setPhase("done");
      }
    },
    [finishTask],
  );

  const pick = (key: "A" | "B") => {
    decide("ch5.puin", key);
    resolveDilemma(sim.current, key === "A" ? "zoeken" : "groep");
    input.current = { L: false, R: false, bell: false };
    setPhase("play");
  };

  return (
    <div className="absolute inset-0 touch-none overflow-hidden bg-night">
      <Canvas shadows="soft" dpr={[1, 2]} style={{ filter: "contrast(1.07) saturate(1.1)" }} camera={{ fov: 62, near: 0.5, far: 200, position: [0, 9.5, 11] }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#1c1a1d"]} />
        <fogExp2 attach="fog" args={["#1c1a1d", 0.021]} />
        <Night moon={[-12, 24, 10]} focus={(out) => out.set(sim.current.x * 0.4, 0, sim.current.z - 10)} extent={30} />
        <BikeWorld sim={sim} />
        <BikeActors sim={sim} kees={kees} shake={shake} />
        <Loop sim={sim} input={input} shake={shake} onHud={setHud} onEvent={onEvent} />
      </Canvas>
      <Cinema />
      {phase === "play" && <BikeHud hud={hud} onSteer={steer} onBell={bell} />}

      <AnimatePresence>
        {phase === "dilemma" && (
          <motion.div key="dilemma" className="absolute inset-0 flex flex-col justify-end gap-4 bg-night/75 px-[22px] pb-[calc(26px+env(safe-area-inset-bottom))] text-parchment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="-rotate-1 bg-parchment px-5 py-4 text-ink shadow-[0_14px_30px_rgba(0,0,0,.55)]">
              <p className="m-0 font-type text-[14.5px] leading-[1.55]">Bij een ingestort huis grijpt een man je stuur. Zijn handen zijn grijs van het stof.</p>
              <p className="m-0 mt-2 font-news text-[17px] italic leading-[1.4]">‘Mijn vrouw ligt eronder!’ Achter je roept Gerrit dat de groep nú de kelder in moet.</p>
            </div>
            <Dilemma id="ch5.puin" ready onPick={pick} />
          </motion.div>
        )}
        {(phase === "intro" || phase === "done") && (
          <motion.div key={phase} className="absolute inset-0 flex flex-col justify-end gap-5 bg-night/70 px-[22px] pb-[calc(26px+env(safe-area-inset-bottom))]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex flex-col gap-2">
              <span className="label text-[10.5px] text-bone">{phase === "intro" ? "26 november 1944 · 16:44" : "Bij de schuilkelder"}</span>
              <h1 className="m-0 font-fell text-[32px] font-normal leading-[1.06] text-parchment">
                {phase === "intro" ? (
                  <>
                    Vluchtspoor <span className="italic text-ochre">bij het station</span>
                  </>
                ) : (
                  ENDINGS[outcome].title
                )}
              </h1>
            </div>
            <div className="-rotate-1 bg-parchment px-5 py-4 text-ink shadow-[0_14px_30px_rgba(0,0,0,.55)]">
              {phase === "intro" ? (
                <ul className="m-0 flex list-none flex-col gap-2 p-0 font-type text-[14px] leading-[1.5]">
                  <li>Stuur met links en rechts om het puin heen. Beide vasthouden is remmen.</li>
                  <li>Bel bij mensen langs de straat: wie je hoort, loopt achter je aan.</li>
                  <li>Hoor je het fluiten, blijf dan uit het rode vlak. Anders stuift iedereen uiteen.</li>
                  <li>Breng ze naar de schuilkelder voordat de aanval voorbij is.</li>
                  {cast && <li>{cast}</li>}
                </ul>
              ) : (
                <p className="m-0 font-news text-[16.5px] leading-[1.5]">{ENDINGS[outcome].body}</p>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={phase === "intro" ? start : () => (sfx.paper(), advance())} className="flex h-[54px] items-center justify-between bg-ochre px-[18px] font-label text-[14px] font-bold tracking-[0.17em] text-slate">
                {phase === "intro" ? "OP DE FIETS" : "LEES DE KRANT"}
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
