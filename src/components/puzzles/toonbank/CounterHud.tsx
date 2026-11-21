"use client";

import { CUSTOMERS } from "@/data/toonbank";
import type { Outcome, Shop } from "@/game/toonbank";
import { TUNING } from "@/game/tuning";
import { TS } from "./ts";

/** The queue (you are the dashed one at the end), the bread in the basket and the unrest. */
export function CounterHud({ shop }: { shop: Shop }) {
  const max = TUNING.toonbank.unrestMax;
  const level = Math.ceil(shop.unrest - 0.001);
  return (
    <div className="grid grid-cols-3 gap-2 px-4 pb-2.5 font-label">
      <div className="flex flex-col gap-1">
        <span className={`label ${TS[11]} text-bone`}>De rij</span>
        <div className="flex items-end gap-1" role="img" aria-label={`Klant ${shop.at + 1} van ${CUSTOMERS.length}, daarna jij`}>
          {CUSTOMERS.map((c, i) => (
            <span key={c.name} className={`h-4 w-2.5 rounded-t-[5px] ${i < shop.at ? "bg-rule" : i === shop.at ? "bg-ochre" : "bg-[#5b636a]"}`} />
          ))}
          <span className="h-4 w-2.5 rounded-t-[5px] border border-dashed border-ochre" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className={`label ${TS[11]} text-bone`}>Broden</span>
        <span className={`font-fell ${TS[24]} leading-none ${shop.loaves <= 1 ? "text-ochre" : "text-parchment"}`} aria-live="polite">
          {shop.loaves}
        </span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className={`label ${TS[11]} text-bone`}>Onrust</span>
        <div className="flex gap-[3px]" role="img" aria-label={`Onrust ${level} van ${max}`}>
          {Array.from({ length: max }, (_, i) => (
            <span key={i} className={`h-2 w-3.5 ${i < level ? "bg-alarm" : "bg-rule"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

const ENDING: Record<Outcome, { title: string; text: string }> = {
  thuis: {
    title: "Het laatste brood",
    text: "De winkelier knikt naar de lege toonbank. ‘Nu jij.’ Hij knipt de bon uit de kaart van je moeder en legt het laatste brood in je handen. Het is nog warm.",
  },
  kok: {
    title: "De mand is leeg",
    text: "Als jij aan de beurt bent, is de mand leeg. De winkelier haalt zijn schouders op. ‘Je weet waar dat brood is gebleven.’ Je loopt met de bonkaart terug naar huis.",
  },
  leeg: {
    title: "De mand is leeg",
    text: "Als jij aan de beurt bent, is de mand leeg. Eén brood te veel weggegeven, en het was het jouwe. Je loopt met de bonkaart terug naar huis.",
  },
};

/** When the queue is empty: your own turn, and how the morning went. */
export function CounterEnd({ shop, result, margarine }: { shop: Shop; result: Outcome; margarine: boolean }) {
  const end = ENDING[result];
  const tried = shop.good + shop.wrong;
  return (
    <div className="flex flex-col gap-3">
      {result === "thuis" && <img src="/img/markt/slot.webp" alt="De winkelier geeft je het laatste brood" className="h-[190px] w-full object-cover" />}
      <div className="flex flex-col gap-2 bg-paper p-4 text-ink shadow-[0_8px_24px_rgba(0,0,0,.5)]">
        <span className={`label ${TS[12]}`}>{end.title}</span>
        <p className={`m-0 font-news ${TS[15]} leading-snug`}>{end.text}</p>
        <p className={`m-0 font-news ${TS[14]} leading-snug text-[#3a3f45]`}>
          {margarine ? "Ook je eigen bon voor margarine gaat erdoor: honderdvijfentwintig gram, precies." : "Margarine is er niet meer: wat te veel werd afgesneden, ging met de rij mee."}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat value={`${CUSTOMERS.length}`} label="klanten geholpen" />
        <Stat value={`${shop.good}/${tried}`} label="bonnen goed geknipt" />
        <Stat value={`${shop.over} g`} label="margarine te veel" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 border border-rule px-2 py-2.5">
      <span className={`font-fell ${TS[24]} text-ochre`}>{value}</span>
      <span className={`font-label ${TS[12]} text-bone`}>{label}</span>
    </div>
  );
}
