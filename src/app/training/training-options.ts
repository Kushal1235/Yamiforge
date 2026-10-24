export interface TrainingCategory {
  id: string;
  name: string;
  resistance: string;
  benefit: string;
  idealFor: string;
  /** Whether this style asks for a weight goal and a weekly split (PPL, upper/lower, ...). */
  usesSplit: boolean;
  /** Suggested training days per week (styles without a split). */
  days: number;
  /** Suggested session titles, in order (styles without a split). */
  sessions: string[];
}

export interface Goal {
  id: string;
  name: string;
  blurb: string;
}

export interface Split {
  id: string;
  name: string;
  commonUse: string;
  why: string;
  /** Goals this split suits best. */
  goals: string[];
  /** Suggested training days per week for this split. */
  days: number;
  /** Session titles in the order they are trained; cycled when more days are chosen. */
  sessions: string[];
}

export const CATEGORIES: ReadonlyArray<TrainingCategory> = [
  { id: 'strength', name: 'Strength Training', resistance: 'Weights / Machines', benefit: 'Pure force production', idealFor: 'Getting stronger, dense bones', usesSplit: true, days: 4, sessions: [] },
  { id: 'bodybuilding', name: 'Bodybuilding', resistance: 'Free weights / Cables', benefit: 'Muscle size & symmetry', idealFor: 'Visual physique changes', usesSplit: true, days: 5, sessions: [] },
  { id: 'calisthenics', name: 'Calisthenics', resistance: 'Gravity & Bodyweight', benefit: 'Relative strength & control', idealFor: 'Athletic mastery of your body', usesSplit: false, days: 4, sessions: ['Push & core', 'Pull & legs', 'Skills & balance', 'Full-body circuit'] },
  { id: 'powerlifting', name: 'Powerlifting', resistance: 'Heavy Barbells', benefit: 'Maximum 1-rep lift power', idealFor: 'Mastering squat/bench/deadlift', usesSplit: false, days: 4, sessions: ['Squat focus', 'Bench focus', 'Deadlift focus', 'Accessories & weak points'] },
  { id: 'hiit-crossfit', name: 'HIIT & CrossFit', resistance: 'Bodyweight, weights & varied tools', benefit: 'Stamina, fat burn & all-round fitness', idealFor: 'Cardio fitness and overall readiness', usesSplit: false, days: 4, sessions: ['HIIT · Sprint intervals', 'CrossFit · Strength & skills', 'HIIT · Circuit finisher', 'CrossFit · Workout of the day'] },
];

export const GOALS: ReadonlyArray<Goal> = [
  { id: 'lose-weight', name: 'Lose weight', blurb: 'Burn fat while holding on to your muscle.' },
  { id: 'gain-weight', name: 'Gain weight', blurb: 'Eat in a surplus and build lean size.' },
];

export const SPLITS: ReadonlyArray<Split> = [
  { id: 'ppl', name: 'Push / Pull / Legs', commonUse: 'strength & bodybuilding', why: 'Balances movement patterns and supports muscle growth.', goals: ['lose-weight', 'gain-weight'], days: 6, sessions: ['Push', 'Pull', 'Legs'] },
  { id: 'upper-lower', name: 'Upper / Lower', commonUse: 'strength training', why: 'Alternates upper and lower body and allows frequent compound-lift practice.', goals: ['lose-weight', 'gain-weight'], days: 4, sessions: ['Upper body', 'Lower body'] },
  { id: 'partnered', name: 'Partnered Muscle Groups', commonUse: 'bodybuilding', why: 'Pairs muscles, e.g. Chest/Triceps and Back/Biceps.', goals: ['gain-weight'], days: 6, sessions: ['Chest & Triceps', 'Back & Biceps', 'Legs & Shoulders'] },
  { id: 'bro', name: 'Single Muscle Group (Bro Split)', commonUse: 'bodybuilding', why: 'Dedicates a session to one muscle group, e.g. chest, back, or legs.', goals: ['gain-weight'], days: 5, sessions: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms'] },
  { id: 'arms-upper', name: 'Arms / Upper-Body Focus', commonUse: 'bodybuilding', why: 'Adds emphasis to arms or upper-body appearance.', goals: ['gain-weight'], days: 5, sessions: ['Chest & Back', 'Arms', 'Legs', 'Shoulders & Arms', 'Upper body'] },
];

export const WEEKDAYS: ReadonlyArray<string> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Weekday indexes (Mon = 0) used for each weekly frequency, leaving rest days in between. */
const DAY_PATTERNS: Readonly<Record<number, ReadonlyArray<number>>> = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
};

export interface PlanDay {
  day: string;
  title: string;
  rest: boolean;
}

export function buildWeek(titles: ReadonlyArray<string>, frequency: number): PlanDay[] {
  const pattern = DAY_PATTERNS[frequency] ?? DAY_PATTERNS[3];
  return WEEKDAYS.map((day, index) => {
    const slot = pattern.indexOf(index);
    return slot === -1
      ? { day, title: 'Rest & recovery', rest: true }
      : { day, title: titles[slot % titles.length], rest: false };
  });
}
