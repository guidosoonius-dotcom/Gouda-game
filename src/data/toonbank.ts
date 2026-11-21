/**
 * The customers at the counter (side story at the Markt, maart 1945). All of them, their cards and
 * the coupon numbers are invented for this game; what is real is in `sources.ts` (brood.*).
 */
import type { Coupon, Customer } from "@/game/toonbank";

/** What the shop's board says this week (the numbers are invented for this game). */
export const BOARD = ["Deze week geldig", "Bon 412 · 1 Zweeds wittebrood", "Bon 415 · 125 gram margarine"];

const why = {
  old: "Die was van vorige maand.",
  board: "Die staat niet op het bord.",
  keep: "Die bewaar je: misschien geldt hij volgende week.",
};
const ok = (label: string): Coupon => ({ label, ok: true });
const no = (label: string, reason: string): Coupon => ({ label, ok: false, why: reason });

export const CUSTOMERS: Customer[] = [
  {
    name: "Mevrouw Brouwer",
    mouths: 4,
    scene: "/img/markt/klant-1.webp",
    coupons: [no("410", why.board), no("411", why.board), ok("412"), no("413", why.keep)],
    margarine: 0,
    loaves: 1,
  },
  {
    name: "Meneer Van Leeuwen",
    mouths: 1,
    scene: "/img/markt/klant-2.webp",
    coupons: [no("409", why.old), no("414", why.board), ok("415"), no("416", why.board)],
    margarine: 125,
    loaves: 0,
  },
  {
    name: "Familie Verhoef",
    mouths: 6,
    scene: "/img/markt/klant-3.webp",
    coupons: [ok("412"), no("413", why.keep), ok("415"), no("410", why.board), ok("412"), ok("415"), no("411", why.board), no("416", why.board)],
    margarine: 250,
    loaves: 2,
  },
  {
    name: "Mevrouw Kok",
    mouths: 3,
    scene: "/img/markt/klant-4.webp",
    coupons: [no("409", why.old)],
    margarine: 0,
    loaves: 0,
    dilemma: true,
  },
  {
    name: "Meneer De Wit",
    mouths: 2,
    scene: "/img/markt/klant-5.webp",
    coupons: [no("414", why.board), ok("415"), no("409", why.old), ok("412")],
    margarine: 125,
    loaves: 1,
    rush: true,
  },
];

/** Lines at the counter, by customer index and step. */
export const LINES = {
  coupons: "Lees het bord. Tik een bon aan om hem uit te knippen.",
  margarine: "Sleep het mes over het blok en laat los om te snijden. Hoe verder naar rechts, hoe zwaarder.",
  bread: "Sleep het brood over de toonbank in de tas.",
  kok: {
    lead: "Haar bon is van vorige maand. Ze schuift hem toch over de toonbank.",
    quote: "‘Mijn jongste ligt al een week met koorts. Eén brood. Niemand hoeft het te weten.’",
    give: { title: "Geef het brood", sub: "Misschien is er dan geen brood meer voor jou." },
    refuse: { title: "Weiger, zoals de regels zijn", sub: "De bon geldt niet. De winkelier kijkt mee." },
    gave: "Ze stopt het brood onder haar jas en is weg voor iemand iets kan zeggen.",
    refused: "Ze knikt. Ze zegt niets meer en loopt naar buiten.",
  },
  rush: {
    quote: "‘Doe er nog één bij, joh. Ik heb haast, en niemand die het ziet.’",
    give: { title: "Vooruit dan", sub: "Eén brood meer uit de mand." },
    refuse: { title: "Nee: één bon, één brood", sub: "Hij moppert en gaat." },
  },
};
