"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BOARD, CUSTOMERS, LINES } from "@/data/toonbank";
import { cutCoupon, decideExtra, decideKok, giveLoaf, margarineForYou, outcome, start, stepOf, wait, weigh, type Shop } from "@/game/toonbank";
import { TUNING } from "@/game/tuning";
import { isFrozen } from "@/lib/pause";
import { sfx } from "@/lib/sound";
import { useStill } from "@/lib/still";
import { useGameStore } from "@/store/useGameStore";
import { CounterBread } from "./toonbank/CounterBread";
import { CounterCard, CounterChoice } from "./toonbank/CounterCard";
import { CounterScale } from "./toonbank/CounterScale";
import { CounterEnd, CounterHud } from "./toonbank/CounterHud";
import { TS } from "./toonbank/ts";

const TICK = 0.25;

/**
 * Behind the counter at the Markt, March 1945 (side story 14). Five customers: cut the coupons the
 * board allows, weigh out margarine, hand over the bread; an expired coupon and a man in a hurry
 * ask for more than the rules give. Whatever is given away is missing when it is your turn.
 */
export function ToonbankPuzzle({ onSolved }: { onSolved: () => void }) {
  const finishTask = useGameStore((s) => s.finishTask);
  const still = useStill();
  const [shop, setShop] = useState<Shop>(start);
  const waited = useRef(0);
  const [restless, setRestless] = useState(false);
  const [note, setNote] = useState<{ text: string; warn?: boolean } | null>(null);
  const step = stepOf(CUSTOMERS, shop);
  const customer = CUSTOMERS[Math.min(shop.at, CUSTOMERS.length - 1)];
  const done = step === null;

  // the queue waits: after a while it grows restless (never while paused or in the background)
  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      if (isFrozen()) return;
      waited.current += TICK;
      const w = waited.current;
      setShop((s) => wait(s, w, TICK));
      setRestless(w > TUNING.toonbank.patience);
    }, TICK * 1000);
    return () => window.clearInterval(id);
  }, [done]);
  useEffect(() => {
    waited.current = 0;
    setRestless(false);
  }, [shop.at]);
  useEffect(() => {
    if (!done) return;
    finishTask("side14.brood", outcome(shop));
    onSolved();
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const say = (text: string, warn = false) => setNote({ text, warn });
  const onCoupon = (i: number) => {
    const r = cutCoupon(CUSTOMERS, shop, i);
    if (r.why) {
      sfx.reject();
      say(`Bon ${customer.coupons[i].label}: ${r.why}`, true);
    } else {
      sfx.paper();
      setNote(null);
    }
    setShop(r.shop);
  };
  const onWeigh = (grams: number) => {
    const r = weigh(CUSTOMERS, shop, grams);
    if (r.verdict === "short") say(`${r.total} gram: te weinig. Snijd er nog een stukje bij.`, true);
    else if (r.verdict === "over") say(`${r.total} gram: ${r.total - customer.margarine} gram te veel. Dat mist de rij straks.`, true);
    else say(`${r.total} gram. Precies genoeg.`);
    setShop(r.shop);
  };
  const onBread = () => {
    setNote(null);
    setShop(giveLoaf(CUSTOMERS, shop));
  };
  const onKok = (give: boolean) => {
    sfx.paper();
    say(give ? LINES.kok.gave : LINES.kok.refused);
    setShop(decideKok(CUSTOMERS, shop, give));
  };
  const onExtra = (give: boolean) => {
    sfx.paper();
    say(give ? "Hij grijnst en is weg." : "‘Ambtenaar,’ moppert hij, en gaat.");
    setShop(decideExtra(CUSTOMERS, shop, give));
  };

  if (done) return <CounterEnd shop={shop} result={outcome(shop)} margarine={margarineForYou(shop)} />;

  return (
    <div className="-mx-5 flex flex-col">
      <CounterHud shop={shop} />
      <div className="relative mx-4 h-[200px] overflow-hidden bg-slate">
        <AnimatePresence initial={false}>
          <motion.img
            key={customer.scene}
            src={customer.scene}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom"
            initial={still ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <span className={`absolute left-3 top-3 bg-paper px-2 py-1 font-label ${TS[12]} font-bold text-ink`}>
          {customer.name} · {customer.mouths} {customer.mouths === 1 ? "mond" : "monden"}
        </span>
        {step === "coupons" && (
          <div className="absolute right-3 top-3 flex w-[150px] flex-col border-[3px] border-[#5b4630] bg-[#1f2e27]/95 px-2.5 py-1.5 font-type text-paper">
            <span className={`${TS[11]} tracking-[0.06em] text-[#c9d7c8]`}>{BOARD[0].toUpperCase()}</span>
            {BOARD.slice(1).map((l) => (
              <span key={l} className={`${TS[12]} leading-snug`}>
                {l}
              </span>
            ))}
          </div>
        )}
      </div>
      <div aria-hidden="true" className="mx-2 h-3.5 border-t-[3px] border-[#8a6342] bg-[#5a3d27] shadow-[0_6px_12px_rgba(0,0,0,.5)]" />
      <div className="flex min-h-[380px] flex-col gap-3 px-4 pb-4 pt-4" style={{ background: "#4a3424 url(/img/markt/counter.webp) center/cover" }}>
        {step === "coupons" && <CounterCard customer={customer} cut={shop.cut} onCut={onCoupon} />}
        {step === "margarine" && <CounterScale need={customer.margarine} piece={shop.piece} onCut={onWeigh} />}
        {step === "bread" && <CounterBread given={shop.given} need={customer.loaves} left={shop.loaves} onGive={onBread} />}
        {step === "dilemma" && (
          <div className="flex flex-col gap-3 bg-dusk/85 p-3">
            <p className={`m-0 font-news ${TS[15]} leading-snug`}>{LINES.kok.lead}</p>
            <p className={`m-0 font-news ${TS[17]} italic leading-snug text-[#f0e6cf]`}>{LINES.kok.quote}</p>
            <p className={`m-0 font-label ${TS[13]} text-bone`}>
              Er {shop.loaves === 1 ? "ligt nog één brood" : `liggen nog ${shop.loaves} broden`} in de mand. Na haar komt er nog één klant, en dan jij.
            </p>
            <CounterChoice
              options={[
                { ...LINES.kok.give, onPick: () => onKok(true), strong: true },
                { ...LINES.kok.refuse, onPick: () => onKok(false) },
              ]}
            />
          </div>
        )}
        {step === "rush" && (
          <div className="flex flex-col gap-3 bg-dusk/85 p-3">
            <p className={`m-0 font-news ${TS[17]} italic leading-snug text-[#f0e6cf]`}>{LINES.rush.quote}</p>
            <CounterChoice
              options={[
                { ...LINES.rush.refuse, onPick: () => onExtra(false), strong: true },
                { ...LINES.rush.give, onPick: () => onExtra(true) },
              ]}
            />
          </div>
        )}
        <p className={`m-0 font-news ${TS[15]} leading-snug text-parchment [text-shadow:0_1px_3px_rgba(0,0,0,.85)]`}>
          {step === "coupons" ? LINES.coupons : step === "margarine" ? LINES.margarine : step === "bread" ? LINES.bread : ""}
        </p>
        <p
          aria-live="polite"
          className={`m-0 min-h-5 font-news ${TS[14]} italic [text-shadow:0_1px_3px_rgba(0,0,0,.85)] ${note?.warn ? "text-[#f6c1b5]" : "text-[#e8d6b8]"}`}
        >
          {note?.text ?? ""}
        </p>
        {restless && <span className={`font-label ${TS[12]} text-[#f6c1b5]`}>De rij begint te morren.</span>}
      </div>
    </div>
  );
}
