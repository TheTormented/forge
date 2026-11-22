# Forge

A personal training log, calorie/macro tracker and weight tracker. It's an installable web app (PWA) that runs offline, with all data stored on the device.

## Features
- **Splits**: editable presets (PPL, PPL + Arms, Bro, Arnold, Upper/Lower, Full Body, Custom) and a weekly schedule.
- **Session logger**: kg × reps per set, last session's numbers shown and prefilled, and a rest timer.
- **Personal bests**: most reps at a given weight (doing 8 @ 95 kg isn't a PB if you've done 8 @ 100 kg). The first time you log an exercise counts as the baseline.
- **Streak**: counts consecutive scheduled sessions. Rest days never break it; a missed scheduled day does.
- **Food**: manual entries, saved foods, saved meals, copy previous day. Calories auto-calculate from macros.
- **Weight**: daily weigh-ins, 7-day average, trend chart.
- **XP & ranks**: session +50, each exercise with a PB +25, on-schedule +20, perfect week +100, macros hit +40.
  XP is recalculated from your data, so edits and deletions never double-count.
  Ranks: Rookie → Iron (5) → Bronze (10) → Silver (15) → Gold (20) → Platinum (30) → Diamond (40) → Titan (50) → Legend (75).
- A day "hits" macros when calories, carbs and fat are within ±10% of target and protein is at least 90%.

## Run locally
```
python -m http.server 8080
```
Open http://localhost:8080. The service worker is skipped on localhost unless you add `?sw` to the URL.

## Deploying updates
Bump `VERSION` in `sw.js` whenever you change files, so installed copies fetch the new version.
Updates reach the phone the next time the app is opened while online (sometimes it takes a second open).

## Backups
Me → Export backup saves a JSON file (on iPhone: Save to Files). Import restores it.
Data lives only on the device, so export now and then.

## Files
- `index.html`, `css/styles.css`: shell and styles
- `js/app.js`: screens and interactions
- `js/logic.js`: streaks, PBs, macros, XP, levels, TDEE
- `js/store.js`: on-device storage (IndexedDB + localStorage fallback)
- `js/presets.js`: split presets and exercise library
- `sw.js`, `manifest.webmanifest`, `icons/`: install and offline support
- `tools/make-icons.ps1`: regenerates the icons
