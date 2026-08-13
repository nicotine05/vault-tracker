export const program = {
  startWeek: 1,
  totalWeeks: 12,

  phases: [
    {
      name: "Rebuild",
      startWeek: 1,
      endWeek: 4,
    },

    {
      name: "Build",
      startWeek: 5,
      endWeek: 8,
    },

    {
      name: "Specific",
      startWeek: 9,
      endWeek: 12,
    },
  ],

  weeklySchedule: {
    1: {
      monday: [
        "Sprint Acceleration",
        "Lower A",
      ],
      tuesday: ["Upper A"],
      wednesday: [
        "Vault Session",
      ],
      thursday: [
        "Sprint Acceleration",
        "Lower B",
      ],
      friday: ["Upper B"],
      saturday: [
        "Vault Session",
      ],
      sunday: ["Recovery"],
    },

    2: {
      monday: [
        "Sprint Acceleration",
        "Lower A",
      ],
      tuesday: ["Upper A"],
      wednesday: [
        "Vault Session",
      ],
      thursday: [
        "Sprint Speed",
        "Lower B",
      ],
      friday: ["Upper B"],
      saturday: [
        "Vault Session",
      ],
      sunday: ["Recovery"],
    },

    3: {
      monday: [
        "Sprint Acceleration",
        "Lower A",
      ],
      tuesday: ["Upper A"],
      wednesday: [
        "Vault Session",
      ],
      thursday: [
        "Sprint Speed",
        "Lower B",
      ],
      friday: ["Upper B"],
      saturday: [
        "Vault Session",
      ],
      sunday: ["Recovery"],
    },

    4: {
      monday: [
        "Sprint Speed",
        "Lower A",
      ],
      tuesday: ["Upper A"],
      wednesday: [
        "Vault Session",
      ],
      thursday: [
        "Sprint Speed",
        "Lower B",
      ],
      friday: ["Upper B"],
      saturday: [
        "Vault Session",
      ],
      sunday: ["Recovery"],
    },
  },
};