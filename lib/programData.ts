const rebuildWeek = {
  phase: "Rebuild",

  days: {
    day1: {
      sprint: {
        distance: "6 x 20m",
        rest: "2 min",
        comment: "Acceleration mechanics",
      },

      lifts: [
        {
          name: "Box Jump",
          sets: "3",
          reps: "5",
          rpe: "-",
          rest: "90 sec",
        },

        {
          name: "Front Squat",
          sets: "4",
          reps: "8",
          rpe: "6-7",
          rest: "2-3 min",
          comment: "Controlled tempo",
        },

        {
          name: "RDL",
          sets: "4",
          reps: "8",
          rpe: "6-7",
          rest: "2 min",
          comment: "Long eccentric",
        },

        {
          name: "Split Squat",
          sets: "3",
          reps: "10",
          rpe: "6",
          rest: "90 sec",
        },

        {
          name: "Leg Raise",
          sets: "3",
          reps: "10",
          rpe: "-",
          rest: "60 sec",
        },
      ],
    },

    day2: {
      lifts: [
        {
          name: "Pullups",
          sets: "4",
          reps: "AMRAP",
          rpe: "7",
          rest: "2 min",
        },

        {
          name: "Bench",
          sets: "4",
          reps: "8",
          rpe: "6-7",
          rest: "2 min",
        },

        {
          name: "Row",
          sets: "4",
          reps: "10",
          rpe: "6-7",
          rest: "90 sec",
        },

        {
          name: "OHP",
          sets: "3",
          reps: "10",
          rpe: "6-7",
          rest: "90 sec",
        },

        {
          name: "High Bar",
          sets: "1",
          reps: "10 min",
          rpe: "-",
          rest: "-",
        },
      ],
    },

    day3: {
      vault: {
        jumpVolume: "10-15",
        jumpFocus: "Short Run",
      },
    },

    day4: {
      sprint: {
        distance: "Bounds 3x20m",
        rest: "90 sec",
        comment: "Reactive contacts",
      },

      lifts: [
        {
          name: "Broad Jump",
          sets: "3",
          reps: "5",
          rpe: "-",
          rest: "90 sec",
        },

        {
          name: "Farmer Carry",
          sets: "3",
          reps: "Trips",
          rpe: "-",
          rest: "60 sec",
        },

        {
          name: "Mobility",
          sets: "1",
          reps: "10 min",
          rpe: "-",
          rest: "-",
        },
      ],
    },
  },
};

const buildWeek = {
  phase: "Build",

  days: {
    day1: {
      sprint: {
        distance: "6 x 30m",
        rest: "3 min",
        comment: "Build acceleration",
      },

      lifts: [
        {
          name: "Box Jump",
          sets: "4",
          reps: "4",
          rpe: "-",
          rest: "90 sec",
        },

        {
          name: "Front Squat",
          sets: "4",
          reps: "6",
          rpe: "7-8",
          rest: "3 min",
        },

        {
          name: "RDL",
          sets: "4",
          reps: "6",
          rpe: "7-8",
          rest: "2-3 min",
        },

        {
          name: "Walking Lunge",
          sets: "3",
          reps: "20",
          rpe: "7",
          rest: "90 sec",
        },

        {
          name: "Ab Wheel",
          sets: "3",
          reps: "10",
          rpe: "-",
          rest: "60 sec",
        },
      ],
    },

    day2: {
      lifts: [
        {
          name: "Weighted Pullup",
          sets: "4",
          reps: "5",
          rpe: "8",
          rest: "2-3 min",
        },

        {
          name: "Bench",
          sets: "4",
          reps: "6",
          rpe: "7-8",
          rest: "2-3 min",
        },

        {
          name: "Row",
          sets: "4",
          reps: "8",
          rpe: "7",
          rest: "90 sec",
        },

        {
          name: "OHP",
          sets: "3",
          reps: "8",
          rpe: "7",
          rest: "90 sec",
        },
      ],
    },

    day3: {
      vault: {
        jumpVolume: "12-18",
        jumpFocus: "Full Approach",
      },
    },

    day4: {
      sprint: {
        distance: "Bounds + Hurdle Hops",
        rest: "90 sec",
        comment: "Elastic contacts",
      },

      lifts: [
        {
          name: "Hurdle Hops",
          sets: "3",
          reps: "8",
          rpe: "-",
          rest: "90 sec",
        },

        {
          name: "Med Ball Throws",
          sets: "5",
          reps: "3",
          rpe: "-",
          rest: "60 sec",
        },
      ],
    },
  },
};

const specificWeek = {
  phase: "Specific",

  days: {
    day1: {
      sprint: {
        distance: "4x30m, 4x40m, 2x60m",
        rest: "Full Recovery",
        comment: "Max velocity",
      },

      lifts: [
        {
          name: "Box Jump",
          sets: "3",
          reps: "3",
          rpe: "-",
          rest: "90 sec",
        },

        {
          name: "Front Squat",
          sets: "3",
          reps: "5",
          rpe: "8",
          rest: "3 min",
        },

        {
          name: "RDL",
          sets: "3",
          reps: "5",
          rpe: "8",
          rest: "3 min",
        },
      ],
    },

    day2: {
      lifts: [
        {
          name: "Weighted Pullup",
          sets: "5",
          reps: "3",
          rpe: "8",
          rest: "3 min",
        },

        {
          name: "Bench",
          sets: "3",
          reps: "5",
          rpe: "8",
          rest: "3 min",
        },

        {
          name: "Row",
          sets: "3",
          reps: "8",
          rpe: "7",
          rest: "90 sec",
        },
      ],
    },

    day3: {
      vault: {
        jumpVolume: "12-15",
        jumpFocus: "Competition Model",
      },
    },

    day4: {
      vault: {
        jumpVolume: "8-12",
        jumpFocus: "Technical Cleanup",
      },
    },
  },
};

export const programData = {
  1: rebuildWeek,
  2: rebuildWeek,
  3: rebuildWeek,
  4: rebuildWeek,

  5: buildWeek,
  6: buildWeek,
  7: buildWeek,
  8: buildWeek,

  9: specificWeek,
  10: specificWeek,
  11: specificWeek,
  12: specificWeek,
};