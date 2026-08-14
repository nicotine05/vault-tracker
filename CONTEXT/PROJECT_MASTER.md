# Vault Tracker

Version: Training Engine V1
Status: Active Development

---

# Project Overview

Vault Tracker is a pole vault training management platform designed to help athletes progress from approximately:

13'0" → 15'0"

while managing:

- Training programs
- Vault sessions
- Strength sessions
- Sprint sessions
- Body weight
- Nutrition
- Performance metrics
- Training history
- Future scheduling

The long-term vision is to become a complete athlete-coach training ecosystem.

---

# Tech Stack

Frontend:
- Next.js
- React
- TypeScript

Deployment:
- GitHub
- Vercel

Target Platforms:
- Desktop
- Mobile

Design Philosophy:
- Mobile-first
- Strong contrast
- Purple accents
- Practical over flashy

---

# Core Application Structure

## Home Page

Purpose:
Athlete dashboard.

Contains:
- Road to 15' dashboard
- PR progress
- Program progress
- Meal plan summary
- Body weight summary
- Today's Training card

---

## Program Page

Purpose:
Training planning and workout generation.

Contains:
- Weekly planner
- Generated schedule
- Planner health
- Traffic light system
- Warning system
- Phase management

This is the primary training management page.

---

## Progress Page

Purpose:
Historical training analysis.

Contains:
- Training history calendar
- Performance graphs
- Historical trends

Important:

This calendar is historical only.

It is NOT a planner.

---

## Log Pages

### Vault Logs

Tracks:
- Session history
- Vault PRs

PR Categories:

- 3L PR
- 4L PR
- 5L PR
- 6L PR
- 7L PR

Stores:
- Height
- Date

---

### Sprint Logs

Tracks:

- 10m PR
- 20m PR
- 30m PR

Stores:
- Time
- Date

Lower times are better.

---

### Strength Logs

Tracks:
- Lift history
- Future strength metrics

---

# Local Storage

Current examples:

weightHistory

currentWeek

programChecks

completedWorkouts

Additional planner and generated schedule storage may exist depending on implementation.

---

# Program Structure

Program Length:

12 Weeks

---

## Rebuild

Weeks:

1-4

Focus:

- General preparation
- Movement quality
- Work capacity
- Technical consistency

---

## Build

Weeks:

5-8

Focus:

- Athletic force production
- Speed development
- Strength conversion

---

## Specific

Weeks:

9-12

Focus:

- Vault performance
- Competition readiness
- Power expression

---

# Weekly Planner

Purpose:

Determine WHEN training occurs.

User assigns:

- Vault
- Strength
- Speed

to days of the week.

Example:

Monday:
Strength

Tuesday:
Vault + Speed

Thursday:
Strength + Speed

Saturday:
Vault

---

# Generated Schedule

Purpose:

Determine WHAT training occurs.

Generated only after planner completion.

Planner disappears after generation.

Generated schedule becomes visible.

Schedule uses:

- Current phase
- Training catalogs
- Progression rules

to assign workouts.

---

# Planner Health

Displays completion of required weekly targets.

Example:

Vault 2/2

Strength 2/2

Speed 2/2

Targets are phase-driven.

Never hardcoded.

---

# Warning System

Examples:

- Consecutive vault days
- Too many speed sessions
- Too many vault sessions
- Missing strength sessions
- Excessive training density

Warnings are advisory.

Not restrictive.

---

# Traffic Light System

Purpose:

Evaluate daily training load.

---

## Load Values

### Vault

VD1 = 1

VD2 = 3

VD3 = 6

VD4 = 10

VD5 = 8

---

### Strength

ST1 = 8

ST2 = 8

ST3 = 5

ST4 = 5

ST5 = 4

ST6 = 3

ST7 = 3

ST8 = 2

---

### Sprint

S1 = 2

S2 = 3

S3 = 3

S4 = 4

S5 = 4

S6 = 4

S7 = 4

S8 = 2

S9 = 3

---

## Thresholds

Green:
0-5

Yellow:
6-9

Orange:
10-13

Red:
14+

---

# Strength Catalog

Contains:

ST1 Heavy Lower

ST2 Heavy Pull

ST3 Strength-Speed

ST4 Dynamic Strength

ST5 Posterior Chain

ST6 Single Leg Athleticism

ST7 Jump Development

ST8 Competition Power

Each workout stores:

- Name
- Load Score
- Primary Lift
- Secondary Lift
- Superset A
- Superset B
- Finisher
- Phase Prescriptions

---

# Sprint Catalog

Contains:

S1 Acceleration Foundations

S2 Acceleration Development

S3 Acceleration Power

S4 Acceleration Advanced

S5 Fly 10

S6 Fly 20

S7 Mixed Fly Session

S8 Pole Run Mechanics

S9 Full Approach Transfer

---

# Vault Catalog

Contains:

VD1 Drill Day

VD2 Technical Day

VD3 Short Run Day

VD4 Competition Day

VD5 Long Run Day

Each workout stores:

- Load Score
- Run Length
- Jump Volume
- Description

---

# Workout Expansion

Generated workouts must be expandable.

Strength:
- Exercises
- Sets
- Reps
- Phase badge

Sprint:
- Distances
- Reps
- Rest
- Purpose

Vault:
- Run length
- Jump volume
- Description

---

# Home Page Integration

Today's Training card should:

- Read generated schedule
- Display today's workouts
- Display traffic light color
- Display daily load score
- Link to Program page

---

# Future Architecture

Planned Support:

- Meet Days
- Travel Days
- Recovery Days
- Deload Days

without major rewrites.

---
