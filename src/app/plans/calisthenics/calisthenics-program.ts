export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  name: string;
  /** Sets × reps or time, as written in the roadmap. */
  dose: string;
  muscles: string;
  cue: string;
}

export interface ProgramDay {
  day: string;
  title: string;
  /** Short line shown on the day tab; rest days carry their guidance here. */
  focus: string;
  exercises: ReadonlyArray<Exercise>;
}

/** What it takes to move past a level. */
export interface UnlockRule {
  sessions: number;
  checks: ReadonlyArray<string>;
}

export interface Level {
  id: FitnessLevel;
  name: string;
  tagline: string;
  goal: string;
  /** Requirements to finish this level and open the next; absent on the last level. */
  unlockNext?: UnlockRule;
  week: ReadonlyArray<ProgramDay>;
}

const ex = (name: string, dose: string, muscles: string, cue: string): Exercise => ({
  name,
  dose,
  muscles,
  cue,
});

const rest = (day: string, title: string, focus: string): ProgramDay => ({
  day,
  title,
  focus,
  exercises: [],
});

export const LEVELS: ReadonlyArray<Level> = [
  {
    id: 'beginner',
    name: 'Beginner',
    tagline: 'Foundation',
    goal: 'Learn technique, build consistency and finish workouts without losing form. Do 2–3 sets per exercise and stop with 2–4 good reps in reserve.',
    unlockNext: {
      sessions: 8,
      checks: [
        '3 sets of 10 controlled incline or standard push-ups',
        '3 sets of 8 supported rows',
        '3 sets of 12 box or bodyweight squats',
        'Hold a good plank for 30 seconds',
        'No pain during any of these movements',
      ],
    },
    week: [
      {
        day: 'Mon',
        title: 'Push & Core',
        focus: 'Incline push-ups and plank',
        exercises: [
          ex('Wall or incline push-up', '3 × 6–12', 'Chest, triceps', 'Use a wall or sturdy raised surface; body stays straight.'),
          ex('Incline pike hold', '2 × 15–20 sec', 'Shoulders', 'Hips high, hands stable; stop if wrist or shoulder discomfort.'),
          ex('Close-grip incline push-up', '2 × 6–10', 'Triceps, chest', 'Keep elbows comfortable; skip if painful.'),
          ex('Dead bug', '2 × 8 / side', 'Core', 'Move slowly; keep your back controlled.'),
          ex('Knee plank', '3 × 15–30 sec', 'Core', 'Straight line from head to knees.'),
        ],
      },
      {
        day: 'Tue',
        title: 'Pull & Legs',
        focus: 'Supported rows, squats, lunges',
        exercises: [
          ex('Supported inverted row or band row', '3 × 6–10', 'Back, biceps', 'Use a securely fixed bar or resistance band.'),
          ex('Assisted pull-up or scapular pull', '2 × 5–8', 'Back, shoulders', 'Use foot or band assistance; no swinging.'),
          ex('Bodyweight box squat', '3 × 8–12', 'Quads, glutes', 'Sit back to a stable box and stand smoothly.'),
          ex('Supported reverse lunge', '2 × 6–8 / leg', 'Legs, balance', 'Hold a stable support if needed.'),
          ex('Glute bridge', '2 × 10–15', 'Glutes', 'Avoid over-arching the lower back.'),
        ],
      },
      rest('Wed', 'Recovery', 'Walking and gentle mobility'),
      {
        day: 'Thu',
        title: 'Skills & Balance',
        focus: 'Dead bug, pike hold, balance',
        exercises: [
          ex('Wrist and shoulder mobility', '3–5 min', 'Preparation', 'Gentle, controlled range only.'),
          ex('Wall-supported calf raise and balance', '2 × 10; 2 × 15 sec / side', 'Ankles, balance', 'Use support near a wall.'),
          ex('Scapular push-up against wall', '2 × 8–12', 'Shoulder control', 'Keep elbows straight.'),
          ex('Tuck support on stable parallettes (feet assisted)', '3 × 8–15 sec', 'Core, shoulders', 'Use stable equipment; skip if wrists hurt.'),
          ex('Bird dog', '2 × 8 / side', 'Core, coordination', 'Avoid twisting the torso.'),
        ],
      },
      {
        day: 'Fri',
        title: 'Easy Full-Body Circuit',
        focus: 'Low-impact circuit, fewer rounds',
        exercises: [
          ex('Incline push-up', '6–10 reps', 'Push muscles', 'Use a height that allows controlled reps.'),
          ex('Box squat', '10–12 reps', 'Legs', 'Knees track in line with toes.'),
          ex('Supported row', '6–10 reps', 'Pull muscles', 'Secure equipment first.'),
          ex('March in place', '30–45 sec', 'Conditioning', 'Low impact; steady breathing.'),
          ex('Glute bridge', '10–12 reps', 'Glutes', 'Smooth reps.'),
          ex('Knee plank', '15–25 sec', 'Core', 'End before posture fails.'),
        ],
      },
      rest('Sat', 'Recovery', 'Rest or easy mobility'),
      rest('Sun', 'Recovery', 'Rest'),
    ],
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    tagline: 'Strength & control',
    goal: 'Build more reps, range of motion and control. Do 2–4 sets and keep 1–3 good reps in reserve.',
    unlockNext: {
      sessions: 12,
      checks: [
        '3 sets of 12 standard push-ups',
        '3 sets of 8 clean rows or a pull-up progression',
        'Controlled lunges and squats',
        'Hold a plank for 45 seconds',
        'Hold a tuck L-sit for 15 seconds, or a suitable regression',
      ],
    },
    week: [
      {
        day: 'Mon',
        title: 'Push & Core',
        focus: 'Standard push-ups and pike push-ups',
        exercises: [
          ex('Standard push-up', '3 × 8–15', 'Chest, triceps', 'Keep body aligned and lower under control.'),
          ex('Pike push-up', '3 × 5–10', 'Shoulders, triceps', 'Use a smaller range if needed.'),
          ex('Close-grip push-up', '2 × 6–12', 'Triceps, chest', 'Hands at a comfortable, narrower position.'),
          ex('Hollow-body tuck hold', '3 × 20–30 sec', 'Core', 'Lower back stays controlled.'),
          ex('Forearm plank', '3 × 30–45 sec', 'Core', 'No hip sag.'),
        ],
      },
      {
        day: 'Tue',
        title: 'Pull & Legs',
        focus: 'Inverted rows, pull-up progression',
        exercises: [
          ex('Inverted row', '3 × 8–12', 'Back, biceps', 'Use a securely fixed bar.'),
          ex('Assisted or strict pull-up progression', '3 × 4–8', 'Lats, biceps', 'Use assistance to keep reps clean.'),
          ex('Bodyweight squat', '3 × 15–20', 'Quads, glutes', 'Controlled depth.'),
          ex('Reverse lunge', '3 × 8–12 / leg', 'Legs, glutes', 'Stable knee and foot alignment.'),
          ex('Single-leg glute bridge (if ready)', '2 × 8–10 / leg', 'Glutes', 'Use the two-leg bridge if your hips rotate.'),
        ],
      },
      rest('Wed', 'Recovery', 'Recovery'),
      {
        day: 'Thu',
        title: 'Skills & Balance',
        focus: 'Tuck L-sit, wall handstand basics',
        exercises: [
          ex('Wall handstand hold or elevated pike hold', '3 × 15–30 sec', 'Shoulders, trunk', 'Only if entry and exit are safe.'),
          ex('Scapular push-up', '2 × 12–15', 'Shoulder control', 'Elbows stay straight.'),
          ex('Tuck L-sit hold', '3 × 10–20 sec', 'Core, hip flexors', 'Use stable parallettes.'),
          ex('Assisted pistol squat to box', '2 × 5–8 / leg', 'Legs, balance', 'Use support and a comfortable depth.'),
          ex('Dead bug', '3 × 8–10 / side', 'Core', 'Slow, controlled reps.'),
        ],
      },
      {
        day: 'Fri',
        title: 'Full-Body Circuit',
        focus: 'Moderate circuit, 2–3 rounds',
        exercises: [
          ex('Push-up', '8–15 reps', 'Push muscles', 'Choose standard or incline.'),
          ex('Bodyweight squat', '15–20 reps', 'Legs', 'Controlled range.'),
          ex('Inverted row', '8–12 reps', 'Pull muscles', 'Use a safe setup.'),
          ex('Mountain climber', '20–30 total', 'Core, conditioning', 'Keep hips steady.'),
          ex('Reverse lunge', '8–10 / leg', 'Legs', 'Controlled steps.'),
          ex('Forearm plank', '30–45 sec', 'Core', 'Do 2–3 rounds; rest 60–120 sec between rounds.'),
        ],
      },
      rest('Sat', 'Recovery', 'Rest or easy mobility'),
      rest('Sun', 'Recovery', 'Rest'),
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    tagline: 'Strength skills',
    goal: 'Develop harder variations only after mastering their prerequisites. Advanced movements are optional, not required for fitness.',
    week: [
      {
        day: 'Mon',
        title: 'Push & Core',
        focus: 'Archer push-up progression',
        exercises: [
          ex('Archer push-up progression', '3 × 4–8 / side', 'Chest, triceps', 'Use an elevated version first; keep both sides even.'),
          ex('Feet-elevated push-up', '3 × 6–12', 'Chest, shoulders', 'Use a stable, low support.'),
          ex('Pike push-up progression', '3 × 6–10', 'Shoulders', 'Progress range gradually; handstand push-ups need separate preparation.'),
          ex('Hollow-body hold', '3 × 30–45 sec', 'Core', 'Keep your back controlled.'),
          ex('Side plank', '3 × 25–40 sec / side', 'Obliques, core', 'Keep hips lifted.'),
        ],
      },
      {
        day: 'Tue',
        title: 'Pull & Legs',
        focus: 'Strict pull-ups, pistol progression',
        exercises: [
          ex('Strict pull-up', '4 × 5–10', 'Lats, biceps', 'No swinging; use assistance if reps degrade.'),
          ex('Feet-elevated inverted row', '3 × 8–12', 'Back, biceps', 'Only with a stable bar.'),
          ex('Pistol squat progression to target', '3 × 4–8 / leg', 'Quads, glutes, balance', 'Use a counterbalance or support as needed.'),
          ex('Single-leg hip bridge', '3 × 10–12 / leg', 'Glutes, hamstrings', 'Keep hips level.'),
          ex('Hanging knee raise progression', '3 × 8–12', 'Core', 'Avoid swinging; use lying knee raises if grip is limited.'),
        ],
      },
      rest('Wed', 'Recovery', 'Recovery'),
      {
        day: 'Thu',
        title: 'Skills & Balance',
        focus: 'Handstand and L-sit progressions',
        exercises: [
          ex('Wall handstand progression', '3 × 20–40 sec', 'Shoulders, trunk', 'Only with a safe setup and a reliable exit.'),
          ex('L-sit progression', '4 × 10–25 sec', 'Core, hip flexors, triceps', 'Progress tuck → one-leg extension → full L-sit.'),
          ex('Assisted handstand push-up progression', '2–3 × 3–6', 'Shoulders, triceps', 'Only with qualified instruction and a safe wall setup; otherwise substitute pike push-ups.'),
          ex('Pistol squat practice', '3 × 5 / leg', 'Legs, balance', 'Stop if knee or hip control is lost.'),
          ex('Hollow-to-arch body control (optional)', '2 × 6–10', 'Trunk control', 'Use only if you are familiar with the movement.'),
        ],
      },
      {
        day: 'Fri',
        title: 'Full-Body Circuit',
        focus: 'Higher-skill circuit, only while form holds',
        exercises: [
          ex('Push-up variation', '8–12 reps', 'Push muscles', 'Select a challenging but controlled variation.'),
          ex('Pull-up', '4–8 reps', 'Pull muscles', 'Use strict form or the assisted version.'),
          ex('Pistol squat progression', '5 / leg', 'Legs', 'Use a target or support if necessary.'),
          ex('Mountain climber', '30–40 total', 'Conditioning', 'Maintain control.'),
          ex('Hanging knee raise', '8–12 reps', 'Core', 'No swinging.'),
          ex('Circuit dose', '2–4 rounds', 'Work capacity', "Rest 90–180 sec between rounds; don't race technical movements."),
        ],
      },
      rest('Sat', 'Recovery', 'Rest or easy mobility'),
      rest('Sun', 'Recovery', 'Rest'),
    ],
  },
];
