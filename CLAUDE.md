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
   <= 1.5 MB of 3D per minigame (the models that minigame loads; `npm run assets` checks the whole kit against 3 MB). Keep model materials simple (base color only): `canal/Kit.tsx` bakes them to vertex
   colours and adds brick, tile, wood and stone detail procedurally in the shader. Image
   textures are allowed only for generated backdrops, ground and the material detail maps of
   "Hoge beeldkwaliteit" (`public/img/<minigame>/*.webp`, `public/img/kit/*.webp`,
   <= 250 KB each, made with Higgsfield, never presented as archive photographs). Props use `build(bevel=...)` for rounded, smooth
   edges; big architecture stays unbevelled. Lighting is designed in R3F, not in Blender.
   Exception, the people: each character starts from a sheet (`docs/characters/*.webp`), is lifted to a
   textured mesh and rigged with Higgsfield (originals in `assets/characters/`) and is then made
   phone-sized by `assets/blender/_figure.py` (decimate, 512 px WebP texture, shared skeleton and
   clips). Original characters only, never a real person. In the game they are `canal/Figure.ts`
   (skinned mesh, clips, two-bone reach) with hand-made poses in `canal/poses.ts`.
4. Mount the canvas only in the minigame view (always through `canal/GameCanvas.tsx`, with memoised
   children so the HUD never re-renders the scene); dispose on exit. Preload the minigame chunk
   while the dossier is open. Resolution is adaptive (`TUNING.gfx.dpr*`: starts at 1.5, max 2).
   Keep the number of lights constant during play (a change recompiles every shader). Measured budget per frame (shadow pass included):
   about 200 draw calls and 270k triangles for the bicycle street, the heaviest scene; keep new
   work inside that, and keep architecture models unbevelled (bevels multiply triangles by ~8). Shadows: one 1024 moon map that follows the player
   plus one per searchlight, all switchable in `TUNING.gfx`; no post-processing passes. The film
   look: vignette and grain in CSS with plain alpha only (no CSS `filter` or blend modes over the
   canvas: each costs a full-screen compositing pass), colour grade and split toning in the tone
   mapping (`Grade` in `GameCanvas`).
5. All movement and damping is frame-rate independent (`1 - Math.exp(-k * dt)`), never per-frame factors.
6. Gameplay numbers live in `src/game/tuning.ts`, never inline.
7. History: never present fiction as fact. Every factual claim and real name lives in
   `src/data/sources.ts` with a source and a `verified: boolean`. Unverified facts are shown in
   every build, visibly marked (dotted line and ?) with their source one tap away. No generated "archive photos": use `ArchivePlaceholder`
   until a licensed scan exists.
8. Chapter 3 (Oosthaven 31) has no score, timer, failure state or modifiers.
9. No game over: failing a minigame changes the story outcome, it never blocks progress.
10. Accessibility: `prefers-reduced-motion`, no flashing above 3 Hz, contrast 4.5:1,
    text scalable (write font sizes as `text-[length:calc(Npx*var(--ts,1))]`, N >= 11; no
    `maximumScale`), every audio cue also visual. iOS has no `navigator.vibrate`. Every 3D
    minigame has a `PauseLayer`; players never see placeholders (dev and preview only).

## Working style (token-efficient)
- One milestone per session; finish its acceptance checks, commit, stop.
- Edit files, do not regenerate them. Keep components < 250 lines.
- Verify UI with one Playwright screenshot at 390x844 (deviceScaleFactor 1) and look at it.
- Verify Blender assets with one low-res EEVEE render (480x270, 8 samples) and look at it.
- Use the installed skills when relevant: `prototype-fast`, `game-feel`, `camera-systems`,
  `threejs-*`, `audio-design`, `game-ui-ux`, `dialogue-systems`, `save-systems`.

## Where things are
- Content: `src/data/chapters.ts`, side stories `src/data/sides.ts` (puzzles in
  `src/components/puzzles/*`, desk and rooms logic in `src/game/bureau.ts` and `src/game/rooms.ts`, all places in `src/data/places.ts`), facts `src/data/sources.ts`, choices and echoes `src/game/choices.ts`.
- Screens: `src/components/screens/*`; chapter 1 puzzle `src/components/packing/*`;
  Nachtvaart `src/components/canal/*`, Over de daken `src/components/rooftop/*`, Vluchtspoor
  `src/components/bike/*`
  (each a pure `sim.ts` tested by a bot; shared model helpers in `canal/Kit.tsx`, lighting in
  `canal/Night.tsx`, generated sky plus environment map in `canal/Sky.tsx`).
- State of the work: `docs/progress.md`; why things are the way they are: `docs/decisions.md`.

## Commands
- `npm run dev` / `npm run build` / `npm test` / `npm run test:e2e` (needs a build first)
- `npm run assets` — runs every `assets/blender/build_*.py` and optimizes the GLBs.
