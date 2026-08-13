export type Exercise = {
  name: string;

  sets?: string;
  reps?: string;

  rpe?: {
    rebuild: string;
    build: string;
    specific: string;
  };

  rest?: string;

  comments?: string;

  sprintDistance?: string;
  sprintRest?: string;

  jumpVolume?: string;
  jumpFocus?: string;
};

export const workouts = {
  upper: {
    "Upper A": [
      {
        name: "Bench Press",
        sets: "4",
        reps: "8",
        rest: "2 min",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Pull Ups",
        sets: "4",
        reps: "AMRAP",
        rest: "2 min",
        rpe: {
          rebuild: "7",
          build: "8",
          specific: "8",
        },
      },
      {
        name: "DB Shoulder Press",
        sets: "3",
        reps: "10",
        rest: "90 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Chest Supported Row",
        sets: "4",
        reps: "10",
        rest: "90 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Hammer Curl",
        sets: "3",
        reps: "12",
        rest: "60 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Tricep Pushdown",
        sets: "3",
        reps: "12",
        rest: "60 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
    ],

    "Upper B": [
      {
        name: "Incline Bench",
        sets: "4",
        reps: "8",
        rest: "2 min",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Lat Pulldown",
        sets: "4",
        reps: "10",
        rest: "90 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "DB Shoulder Press",
        sets: "3",
        reps: "10",
        rest: "90 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Cable Row",
        sets: "4",
        reps: "10",
        rest: "90 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "EZ Curl",
        sets: "3",
        reps: "12",
        rest: "60 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Overhead Tricep Extension",
        sets: "3",
        reps: "12",
        rest: "60 sec",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
    ],
  },

  strength: {
    "Lower A": [
      {
        name: "Trap Bar Deadlift",
        sets: "4",
        reps: "6",
        rest: "3 min",
        comments: "Explosive concentric",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Bulgarian Split Squat",
        sets: "3",
        reps: "10",
        rest: "90 sec",
        comments: "Long eccentric",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
    ],

    "Lower B": [
      {
        name: "Leg Press",
        sets: "4",
        reps: "10",
        rest: "2 min",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
      {
        name: "Walking Lunge",
        sets: "3",
        reps: "20 Steps",
        rest: "90 sec",
        comments: "Controlled tempo",
        rpe: {
          rebuild: "6",
          build: "7",
          specific: "8",
        },
      },
    ],
  },

  sprint: {
    "Sprint Acceleration": [
      {
        name: "Acceleration Sprint",
        sprintDistance: "6 x 20m",
        sprintRest: "2 min",
        comments: "Explosive start",
      },
      {
        name: "Bounds",
        sprintDistance: "3 x 20m",
        sprintRest: "90 sec",
      },
    ],

    "Sprint Speed": [
      {
        name: "Flying 20",
        sprintDistance: "6 x 20m",
        sprintRest: "3 min",
        comments: "Build-up run",
      },
      {
        name: "Hurdle Hops",
        sets: "3",
        reps: "8",
      },
    ],
  },

  vault: {
    "Vault Session": [
      {
        name: "Technical Vault",
        jumpVolume: "12-18 jumps",
        jumpFocus: "Short Run",
      },
      {
        name: "Competition Vault",
        jumpVolume: "8-12 jumps",
        jumpFocus: "Full Approach",
      },
    ],
  },
};