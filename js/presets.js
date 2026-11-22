// Split presets and exercise library.
// Exercise shorthand: [name, sets, repsMin, repsMax, restSec]

const ex = (name, sets, min, max, rest = 90) => ({ name, sets, repsMin: min, repsMax: max, rest });

const PUSH = [
  ex('Barbell Bench Press', 4, 6, 8, 150),
  ex('Incline Dumbbell Press', 3, 8, 10, 120),
  ex('Overhead Press', 3, 6, 8, 120),
  ex('Lateral Raise', 3, 12, 15, 60),
  ex('Cable Fly', 3, 10, 12, 60),
  ex('Triceps Pushdown', 3, 10, 12, 60),
  ex('Overhead Triceps Extension', 2, 10, 12, 60),
];
const PULL = [
  ex('Deadlift', 3, 4, 6, 180),
  ex('Pull-Up', 3, 6, 10, 120),
  ex('Barbell Row', 3, 6, 8, 120),
  ex('Lat Pulldown', 3, 10, 12, 90),
  ex('Face Pull', 3, 12, 15, 60),
  ex('Barbell Curl', 3, 8, 10, 60),
  ex('Hammer Curl', 2, 10, 12, 60),
];
const LEGS = [
  ex('Back Squat', 4, 5, 8, 180),
  ex('Romanian Deadlift', 3, 8, 10, 120),
  ex('Leg Press', 3, 10, 12, 120),
  ex('Leg Curl', 3, 10, 12, 60),
  ex('Leg Extension', 3, 12, 15, 60),
  ex('Standing Calf Raise', 4, 10, 15, 60),
];
const ARMS = [
  ex('Close-Grip Bench Press', 3, 6, 8, 120),
  ex('Barbell Curl', 3, 8, 10, 60),
  ex('Skull Crusher', 3, 8, 10, 60),
  ex('Incline Dumbbell Curl', 3, 10, 12, 60),
  ex('Triceps Pushdown', 3, 10, 12, 60),
  ex('Hammer Curl', 3, 10, 12, 60),
  ex('Wrist Curl', 2, 12, 15, 45),
];

const W = (mon, tue, wed, thu, fri, sat, sun) => [sun, mon, tue, wed, thu, fri, sat]; // index = JS getDay()

export const PRESETS = [
  {
    id: 'ppl', name: 'Push / Pull / Legs', blurb: '6 days · each muscle twice a week',
    days: [
      { name: 'Push', exercises: PUSH },
      { name: 'Pull', exercises: PULL },
      { name: 'Legs', exercises: LEGS },
    ],
    schedule: W(0, 1, 2, 0, 1, 2, null),
  },
  {
    id: 'ppla', name: 'Push / Pull / Legs / Arms', blurb: '4–5 days · extra arm day',
    days: [
      { name: 'Push', exercises: PUSH },
      { name: 'Pull', exercises: PULL },
      { name: 'Legs', exercises: LEGS },
      { name: 'Arms', exercises: ARMS },
    ],
    schedule: W(0, 1, null, 2, 3, null, null),
  },
  {
    id: 'bro', name: 'Bro Split', blurb: '5 days · one muscle group per day',
    days: [
      { name: 'Chest', exercises: [ex('Barbell Bench Press', 4, 6, 8, 150), ex('Incline Dumbbell Press', 3, 8, 10, 120), ex('Machine Chest Press', 3, 10, 12, 90), ex('Cable Fly', 3, 12, 15, 60), ex('Dips', 3, 8, 12, 90)] },
      { name: 'Back', exercises: [ex('Deadlift', 3, 4, 6, 180), ex('Pull-Up', 3, 6, 10, 120), ex('Barbell Row', 3, 6, 8, 120), ex('Seated Cable Row', 3, 10, 12, 90), ex('Lat Pulldown', 3, 10, 12, 90)] },
      { name: 'Shoulders', exercises: [ex('Overhead Press', 4, 6, 8, 150), ex('Seated Dumbbell Press', 3, 8, 10, 120), ex('Lateral Raise', 4, 12, 15, 60), ex('Rear Delt Fly', 3, 12, 15, 60), ex('Barbell Shrug', 3, 10, 12, 60)] },
      { name: 'Arms', exercises: ARMS },
      { name: 'Legs', exercises: LEGS },
    ],
    schedule: W(0, 1, 2, 3, 4, null, null),
  },
  {
    id: 'arnold', name: 'Arnold Split', blurb: '6 days · chest/back, shoulders/arms, legs',
    days: [
      { name: 'Chest & Back', exercises: [ex('Barbell Bench Press', 4, 6, 8, 150), ex('Pull-Up', 4, 6, 10, 120), ex('Incline Dumbbell Press', 3, 8, 10, 90), ex('Barbell Row', 3, 6, 8, 120), ex('Dumbbell Fly', 3, 10, 12, 60), ex('Dumbbell Pullover', 3, 10, 12, 60)] },
      { name: 'Shoulders & Arms', exercises: [ex('Overhead Press', 4, 6, 8, 150), ex('Lateral Raise', 3, 12, 15, 60), ex('Rear Delt Fly', 3, 12, 15, 60), ex('Barbell Curl', 3, 8, 10, 60), ex('Skull Crusher', 3, 8, 10, 60), ex('Incline Dumbbell Curl', 3, 10, 12, 60), ex('Triceps Pushdown', 3, 10, 12, 60)] },
      { name: 'Legs', exercises: LEGS },
    ],
    schedule: W(0, 1, 2, 0, 1, 2, null),
  },
  {
    id: 'ul', name: 'Upper / Lower', blurb: '4 days · strength and size',
    days: [
      { name: 'Upper A', exercises: [ex('Barbell Bench Press', 4, 5, 8, 150), ex('Barbell Row', 4, 6, 8, 120), ex('Overhead Press', 3, 8, 10, 120), ex('Lat Pulldown', 3, 10, 12, 90), ex('Barbell Curl', 2, 10, 12, 60), ex('Triceps Pushdown', 2, 10, 12, 60)] },
      { name: 'Lower A', exercises: [ex('Back Squat', 4, 5, 8, 180), ex('Romanian Deadlift', 3, 8, 10, 120), ex('Leg Curl', 3, 10, 12, 60), ex('Standing Calf Raise', 4, 10, 15, 60)] },
      { name: 'Upper B', exercises: [ex('Incline Dumbbell Press', 4, 8, 10, 120), ex('Pull-Up', 4, 6, 10, 120), ex('Seated Dumbbell Press', 3, 8, 10, 90), ex('Seated Cable Row', 3, 10, 12, 90), ex('Lateral Raise', 3, 12, 15, 60), ex('Hammer Curl', 2, 10, 12, 60)] },
      { name: 'Lower B', exercises: [ex('Deadlift', 3, 4, 6, 180), ex('Leg Press', 3, 10, 12, 120), ex('Bulgarian Split Squat', 3, 8, 10, 90), ex('Leg Extension', 3, 12, 15, 60), ex('Seated Calf Raise', 3, 12, 15, 60)] },
    ],
    schedule: W(0, 1, null, 2, 3, null, null),
  },
  {
    id: 'fb', name: 'Full Body', blurb: '3 days · whole body each session',
    days: [
      { name: 'Full Body A', exercises: [ex('Back Squat', 3, 5, 8, 150), ex('Barbell Bench Press', 3, 5, 8, 150), ex('Barbell Row', 3, 6, 8, 120), ex('Lateral Raise', 2, 12, 15, 60), ex('Barbell Curl', 2, 10, 12, 60)] },
      { name: 'Full Body B', exercises: [ex('Deadlift', 3, 4, 6, 180), ex('Overhead Press', 3, 6, 8, 120), ex('Pull-Up', 3, 6, 10, 120), ex('Leg Curl', 2, 10, 12, 60), ex('Triceps Pushdown', 2, 10, 12, 60)] },
      { name: 'Full Body C', exercises: [ex('Leg Press', 3, 10, 12, 120), ex('Incline Dumbbell Press', 3, 8, 10, 120), ex('Seated Cable Row', 3, 10, 12, 90), ex('Face Pull', 2, 12, 15, 60), ex('Standing Calf Raise', 3, 10, 15, 60)] },
    ],
    schedule: W(0, null, 1, null, 2, null, null),
  },
  {
    id: 'custom', name: 'Custom', blurb: 'Start empty and build your own',
    days: [{ name: 'Day 1', exercises: [] }],
    schedule: W(0, null, null, null, null, null, null),
  },
];

export const EXERCISE_LIBRARY = [...new Set([
  ...[PUSH, PULL, LEGS, ARMS].flat().map(e => e.name),
  ...PRESETS.flatMap(p => p.days.flatMap(d => d.exercises.map(e => e.name))),
  'Front Squat', 'Hack Squat', 'Hip Thrust', 'Walking Lunge', 'Goblet Squat', 'Sumo Deadlift',
  'Dumbbell Bench Press', 'Decline Bench Press', 'Push-Up', 'Pec Deck', 'Arnold Press',
  'Chin-Up', 'T-Bar Row', 'Single-Arm Dumbbell Row', 'Chest-Supported Row', 'Rack Pull',
  'Cable Lateral Raise', 'Upright Row', 'Preacher Curl', 'Cable Curl', 'Concentration Curl',
  'Dumbbell Kickback', 'Plank', 'Hanging Leg Raise', 'Cable Crunch', 'Ab Wheel Rollout',
])].sort();
