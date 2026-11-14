# Koerier aan de Gouwe — agent rules

Historical WWII location game for Gouda (1940–1945), mobile web, ages 12+.
Full design: `docs/design.md`. Plan and current milestone: `docs/roadmap.md`.
Read only the section you need; do not load whole documents by default.

## Stack
- Next.js (App Router, TypeScript), Tailwind, Framer Motion, Zustand (persist).
- 3D: three + @react-three/fiber + @react-three/drei, loaded with `dynamic(..., { ssr: false })`.
- Audio: Web Audio API; short compressed files (m4a/mp3) are allowed for ambience and voice.

## Hard rules
1. Player-facing text in Dutch. Code, identifiers, comments in English.
2. Mobile-first: portrait, `100dvh`, `max-w-[430px]` centered, `touch-action: none` on canvases,
   touch targets >= 44px, safe-area insets respected.
3. 3D assets come only from Blender scripts in this repo (`assets/blender/*.py`, run headless via
   `bpy` or the `bpy` MCP server) and are exported to `public/models/*.glb`.
   No third-party model downloads. Budget: <= 250 KB per GLB after `gltf-transform optimize`,
   <= 1.5 MB of 3D per minigame. Keep materials simple (base color / vertex color);
   lighting is designed in R3F, not in Blender.
4. Mount `<Canvas>` only in the minigame view; dispose on exit. Preload the minigame chunk
   while the dossier is open. Cap DPR at 2. No realtime shadows on mobile; use baked AO / blob shadows.
5. All movement and damping is frame-rate independent (`1 - Math.exp(-k * dt)`), never per-frame factors.
6. Gameplay numbers live in `src/game/tuning.ts`, never inline.
7. History: never present fiction as fact. Every factual claim and real name lives in
   `src/data/sources.ts` with a source and a `verified: boolean`. Unverified facts render as
   visible placeholders in dev builds. No generated "archive photos": use `ArchivePlaceholder`
   until a licensed scan exists.
8. Chapter 3 (Oosthaven 31) has no score, timer, failure state or modifiers.
9. No game over: failing a minigame changes the story outcome, it never blocks progress.
10. Accessibility: `prefers-reduced-motion`, no flashing above 3 Hz, contrast 4.5:1,
    text scalable, every audio cue also visual. iOS has no `navigator.vibrate`.

## Working style (token-efficient)
- One milestone per session; finish its acceptance checks, commit, stop.
- Edit files, do not regenerate them. Keep components < 250 lines.
- Verify UI with one Playwright screenshot at 390x844 (deviceScaleFactor 1) and look at it.
- Verify Blender assets with one low-res EEVEE render (480x270, 8 samples) and look at it.
- Use the installed skills when relevant: `prototype-fast`, `game-feel`, `camera-systems`,
  `threejs-*`, `audio-design`, `game-ui-ux`, `dialogue-systems`, `save-systems`.

## Where things are
- Content: `src/data/chapters.ts`, facts `src/data/sources.ts`, choices and echoes `src/game/choices.ts`.
- Screens: `src/components/screens/*`; chapter 1 puzzle `src/components/packing/*`;
  Nachtvaart `src/components/canal/*` and Over de daken `src/components/rooftop/*`
  (each a pure `sim.ts` tested by a bot; shared model helpers in `canal/Kit.tsx`).
- State of the work: `docs/progress.md`; why things are the way they are: `docs/decisions.md`.

## Commands
- `npm run dev` / `npm run build` / `npm test` / `npm run test:e2e` (needs a build first)
- `npm run assets` — runs every `assets/blender/build_*.py` and optimizes the GLBs.
