/** Every gameplay number lives here (CLAUDE.md #6). Tune after playtests, never inline. */
export const TUNING = {
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
