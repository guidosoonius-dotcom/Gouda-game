/** Every gameplay number lives here (CLAUDE.md #6). Tune after playtests, never inline. */
export const TUNING = {
  /** Graphics switches: turn these off first if a phone cannot hold 60 fps. */
  gfx: {
    /** Moonlight casts soft shadows (one 1024 map that follows the player). */
    shadows: true,
    /** Searchlights cast shadows too (one extra map per light). */
    spotShadows: true,
    /** Procedural brick, tile, wood and stone detail in the shader. */
    detail: true,
    /** "Hoge beeldkwaliteit" (settings.hifi): detail maps made from generated material photos,
     *  relief from them, and a sharper moon shadow. Off, the shader draws its patterns itself. */
    hifi: {
      shadowMap: 2048,
      /** Metres covered by one repeat of each detail map: brick, tiles, wood, stone, cobble, plaster. */
      scale: [2.6, 2.4, 1.3, 2.6, 2.2, 3.2],
      /** Depth in metres of the relief (mortar joints, tile edges, planks), faded out with distance. */
      bump: 0.012,
      /** Relief of the clinkers in the bicycle street (three's bumpScale on the cobble image). */
      streetBump: 0.03,
    },
    /** Ambient life in the bicycle chapter: extra people, aircraft, debris, embers and ash. */
    life: true,
    /** Render resolution (device pixels per CSS pixel): starts at dprStart (or the device's own if
     *  lower), climbs by dprStep up to dprMax while there is room, and steps down (to dprMin) when
     *  the frame rate stays under fpsLow. */
    dprStart: 1.5,
    dprMax: 2,
    dprMin: 1,
    dprStep: 0.25,
    fpsLow: 50,
    /** Above this for adaptRise windows in a row the resolution steps back up. */
    fpsHigh: 58,
    adaptRise: 4,
    /** Seconds per measurement window, and seconds ignored at the start (shaders, loading). */
    adaptWindow: 1,
    adaptWarmup: 2.5,
    /** Seconds without judging after a change (the resize itself costs a frame or two). */
    adaptCooldown: 2,
  },
  /**
   * Hulpmodus (a setting): gentler minigames for younger or less practised players. Factors on
   * the values above; the story and its outcomes stay the same. Never for chapter 3 (no game).
   */
  assist: {
    canal: { exposureLimit: 1.6, strokeNoise: 0.8, noiseAlert: 1.15, sweepPeriod: 1.25 },
    rooftop: { exposureLimit: 1.8, jumpWindow: 1.3, jumpClean: 1.5, time: 1.2 },
    bike: { time: 1.25, bombEvery: 1.35, bombWarn: 1.4, bellRange: 1.25 },
    packing: { rumbleInterval: 1.5 },
    toonbank: { unrestPerSecond: 0.6, tolerance: 1.5 },
  },
  ui: {
    /** Text size steps (multiplier on every font size): normal, large, largest. */
    textScales: [1, 1.15, 1.3],
  },
  /** Side story at the town hall: stalling orders at the messenger's desk. */
  bureau: {
    /** Suspicion runs from 0 to this; at the top the messenger is moved to another office. */
    suspicionMax: 5,
    /** From this much suspicion on, the messenger is on a list. */
    listedAt: 3,
    /** Sending an order back over something that is not wrong. */
    wrongGuess: 1,
    /** Leaving an order on the desk: costs suspicion, wins a day. */
    leave: 2,
    leaveGain: 1,
    /** Signing calms the occupier down a little. */
    signRelief: 1,
  },
  /** Side story at the Markt, April 1945: helping out behind the counter (`game/toonbank.ts`). */
  toonbank: {
    /** Loaves in the basket at the start: exactly enough for every customer and you, if nobody
     *  gets bread they have no coupon for. */
    loaves: 5,
    /** Grams of margarine on the counter at the start, and per coupon. */
    margarine: 600,
    portion: 100,
    /** The piece on the knife: grams in the whole block shown, and how far off still counts as good. */
    blockGrams: 400,
    tolerance: 15,
    /** Unrest in the queue runs from 0 to this. */
    unrestMax: 5,
    /** Unrest per second a customer waits (after `patience` seconds), per wrong cut, and the calm
     *  that a served customer brings. */
    patience: 14,
    unrestPerSecond: 0.07,
    wrongCut: 1,
    served: 1,
  },
  packing: {
    /** Seconds between distant shock waves. */
    rumbleInterval: 30,
    /** After this many shock waves Willem takes over the remaining panels. */
    rumblesBeforeHelp: 3,
    /** Finger must travel this far (px) before a press counts as a drag. */
    dragThreshold: 7,
    /** Dragged panel floats this far (px) above the finger so it stays visible. */
    fingerLift: 56,
    /** A drop snaps when the panel is within this many cells of a valid slot. */
    snapCells: 0.6,
  },
  bike: {
    /** Seconds until the raid is over and Gerrit takes over. */
    time: 95,
    /** Riding alone, and walking pace with people behind you (m/s). */
    rideSpeed: 5.0,
    walkSpeed: 2.7,
    /** Sideways steering speed (m/s). */
    steer: 3.4,
    /** People within this distance come along when the bell rings (m). */
    bellRange: 6.5,
    /** Seconds between falling bombs, the warning before each, and how far people scatter from it. */
    bombEvery: 7.5,
    bombWarn: 2.6,
    bombRadius: 4.6,
  },
  /** Location mode (walking through Gouda). */
  location: {
    /** Unlock a chapter this close to its address (m); a manual "Ik ben er" is always there as well. */
    near: 30,
    /** Faster than this (m/s) counts as walking: minigames are blocked (a stroll is 1.0, brisk 1.4). */
    walkSpeed: 0.9,
    /** Back below this (m/s) for `calmFor` seconds and the block is lifted. */
    calmSpeed: 0.5,
    /** Speed is the distance covered over this many seconds: long enough that GPS jitter averages out. */
    window: 6,
    calmFor: 3,
    /** No fix for this long (s) means standing still: iOS only reports when you move. */
    staleAfter: 4,
    /** A fix with a worse accuracy than this (m) is too vague to judge speed by. */
    maxAccuracy: 25,
    /** The "I am sitting or standing still" override silences the block for this long (s). */
    overrideFor: 90,
  },
  rooftop: {
    /** Seconds until curfew (19:52 to 20:00 on the clock). */
    time: 80,
    /** Running speed along the ridge (m/s), alone and with Kees in tow. */
    runSpeed: 4.6,
    keesSpeed: 4.0,
    /** How far Kees trails behind (m): he must be out of the light as well. */
    keesGap: 2.0,
    /** Seconds in the light before the guard whistles. */
    exposureLimit: 0.3,
    /** Lying flat on the tiles, the light counts only this much. */
    flatFactor: 0.3,
    /** Times caught before you give up the roofs and take the alley (no game over). */
    maxCaught: 3,
    /** Alleys: how far before the take-off point a tap counts as a jump (m), and the last stretch
     *  of that in which it is a clean jump. Earlier is too early: you grab the far edge. */
    jumpWindow: 2.6,
    jumpClean: 1.3,
    /** Seconds hanging from the far edge after a jump that came too early. */
    scramble: 0.9,
    /** A jump from standing (after hesitating at the edge) crosses at this fraction of the speed. */
    standingJump: 0.7,
  },
  canal: {
    /** Course length in metres from start to the lock gate. */
    length: 140,
    /** Half the navigable canal width in metres. */
    halfWidth: 5.2,
    /** Forward speed added by one stroke (m/s). */
    strokeImpulse: 1.55,
    /** Extra impulse when both oars alternate cleanly (rhythm bonus). */
    rhythmBonus: 0.35,
    /** Max seconds between alternating strokes to count as rhythm. */
    rhythmWindow: 0.9,
    /** Yaw added by one stroke (radians). */
    strokeYaw: 0.22,
    /** Velocity damping rate (1/s) while gliding. */
    glideDamping: 0.55,
    /** Velocity damping rate (1/s) while holding both oars (braking). */
    brakeDamping: 3.2,
    /** Yaw damping rate (1/s). */
    yawDamping: 2.4,
    /** How fast the bow turns toward the heading (1/s). */
    steerRate: 1.1,
    maxSpeed: 4.2,
    /** Noise added per stroke (0..1). */
    strokeNoise: 0.17,
    /** Multipliers when Marie's brother is aboard (chapter 4, choice "mee"). */
    brother: { impulse: 0.88, rhythm: 2.4, noise: 1.25 },
    /** Sideways speed (m/s) above which hitting the quay counts as a knock, and its noise. */
    bumpSpeed: 1.4,
    bumpNoise: 0.12,
    /** Noise decay per second. */
    noiseDecay: 0.14,
    /** Above this noise level the guard turns his light toward the boat. */
    noiseAlert: 0.72,
    /** Seconds in the beam (unhidden) before the guard whistles. */
    exposureLimit: 1.15,
    /** Guard light sweep: seconds per full left-right-left cycle. */
    sweepPeriod: 9,
    /** Bells of the Sint-Jan: seconds between tolls and how long they mask noise. */
    bellEvery: 24,
    bellDuration: 7,
    /** Times caught before Marie takes an alternative route (no game over). */
    maxCaught: 3,
    /** Seconds without input before the boat counts as "lying still" in reeds. */
    stillSpeed: 0.35,
  },
} as const;
