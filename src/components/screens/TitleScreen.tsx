"use client";

import { useGameStore, type Mode } from "@/store/useGameStore";
import { sfx, unlockAudio } from "@/lib/sound";
import { Arrow, Headphones } from "@/components/ui/icons";

function ModeButton({
  mode,
  title,
  sub,
  primary,
}: {
  mode: Mode;
  title: string;
  sub: string;
  primary?: boolean;
}) {
  const start = useGameStore((s) => s.start);
  return (
    <button
      type="button"
      onClick={() => {
        unlockAudio();
        sfx.paper();
        start(mode);
      }}
      className={`flex min-h-16 items-center justify-between px-[18px] text-left transition-transform active:translate-x-1 ${
        primary ? "bg-ochre text-slate" : "border border-parchment/45 bg-night/35 text-parchment"
      }`}
    >
      <span className="flex flex-col gap-[3px]">
        <span className="label text-[15px] tracking-[0.16em]">{title}</span>
        <span
          className={`font-label text-[12.5px] font-medium tracking-wide ${primary ? "text-[#3a2e14]" : "text-[#a9a396]"}`}
        >
          {sub}
        </span>
      </span>
      <Arrow color={primary ? "#14181d" : "#ede6d6"} />
    </button>
  );
}

export function TitleScreen() {
  const hasProgress = useGameStore((s) => s.completed.length > 0);
  const mode = useGameStore((s) => s.mode);

  return (
    <div className="absolute inset-0 overflow-hidden bg-night text-parchment">
      <div
        className="anim-kenburns absolute -inset-5 bg-cover"
        style={{ backgroundImage: "url(/img/scenes/daken.webp)", backgroundPosition: "50% 20%" }}
      />
      <div
        className="anim-sweep absolute left-10 top-[18%] h-[120px] w-[520px] mix-blend-screen blur-[10px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,226,150,.34), rgba(255,226,150,.08) 55%, rgba(255,226,150,0))",
          clipPath: "polygon(0 46%, 100% 0, 100% 100%, 0 54%)",
        }}
      />
      <div
        className="anim-fog absolute -left-20 top-[36%] h-[220px] w-[560px] blur-[10px]"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(150,165,180,.28), rgba(150,165,180,0) 70%)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,13,17,.82) 0%, rgba(10,13,17,0) 22%, rgba(10,13,17,0) 38%, rgba(10,13,17,.86) 60%, #0a0d11 80%)",
        }}
      />

      <div className="absolute inset-x-6 top-[max(54px,env(safe-area-inset-top))] flex items-center gap-3">
        <span className="label text-[11px] tracking-[0.27em] text-bone">Vijf avonden in Gouda</span>
        <span className="h-px flex-1 bg-bone/40" />
        <span className="label text-[11px] tracking-[0.27em] text-bone">1940—1945</span>
      </div>

      <div className="absolute inset-x-6 bottom-[max(30px,env(safe-area-inset-bottom))] flex flex-col gap-[22px]">
        <h1 className="m-0 flex flex-col font-normal">
          <span className="font-fell text-[76px] leading-[0.86] tracking-[-1.5px]">Koerier</span>
          <span className="pl-1 font-fell text-[36px] italic leading-[1.1] text-ochre">aan de Gouwe</span>
        </h1>
        <p className="m-0 max-w-[310px] font-type text-[15px] leading-[1.55] text-[#d8d0be]">
          Gouda, mei 1940. De grond trilt, het glas moet weg, en iemand vraagt je om een papier dat je maar één keer
          kunt geven.
          <span className="anim-caret text-ochre">▍</span>
        </p>

        <div className="flex flex-col gap-2.5">
          <ModeButton
            mode="location"
            title={hasProgress && mode === "location" ? "Ga verder op locatie" : "Speel op locatie"}
            sub="Een wandeling door de binnenstad van Gouda"
            primary
          />
          <ModeButton
            mode="home"
            title={hasProgress && mode === "home" ? "Ga verder thuis" : "Speel thuis"}
            sub="Met de kaart, de beelden en een koptelefoon"
          />
        </div>

        <div className="flex items-center justify-between font-label text-[11px] font-semibold tracking-[0.15em] text-ash">
          <span className="flex items-center gap-2">
            <Headphones color="#8f989f" />
            KOPTELEFOON AANBEVOLEN
          </span>
          <span>12+</span>
        </div>
      </div>
    </div>
  );
}
