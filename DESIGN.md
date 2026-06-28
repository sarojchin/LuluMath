# LuluMath — Multiplication Training Game

**Design document v0.2**
Platform: iOS + Android phone app · Stack: **React Native + Expo (TypeScript)**

> **Stack note (v0.2):** originally scoped for Unity, but switched to **Expo** so the
> game can be tested instantly on both iPhone and Android via the Expo Go app — no
> Xcode, no Android SDK, no Mac build chain required. The 3D pet (Milestone 3+) will
> use `expo-gl` + `three.js` (react-three-fiber) rather than Unity's renderer.

---

## 1. Vision

A bite-sized mobile game that teaches kids their multiplication tables through
**timed mastery challenges**, and keeps them coming back with a **3D pet that
grows and evolves** as they learn. Every question and every table completed
earns EXP. EXP levels up the pet, and the player makes choices that shape what
the pet becomes. The math is the engine; the pet is the reason to keep playing.

**Design pillars**
1. **Mastery, not just answers** — speed + accuracy gates, not endless drilling.
2. **Always-forward progression** — clear, ordered path from 1× to 12×.
3. **A companion you build** — the pet is personal and choice-driven.
4. **Short sessions** — a single challenge is ~15–60 seconds; a full session is a few minutes.

---

## 2. Core Game Loop

```
Pick next challenge  ──►  Answer questions (timed)  ──►  Pass / retry
        ▲                                                    │
        │                                                    ▼
   Pet grows  ◄──  Spend EXP / choose evolution  ◄──  Earn EXP
```

A child opens the app, sees their pet, taps **Play**, and is dropped into the
next unmastered challenge. They answer, earn EXP, watch the pet react, and
either advance or get a friendly "try again."

---

## 3. Curriculum & Progression

The heart of the request. Each table is mastered in **stages**, and new tables
unlock only after the previous one is mastered. Earlier tables are folded back
in as cumulative review.

### Stage types

| Stage | Question source | Pass condition |
|-------|-----------------|----------------|
| **In Order** | Table N, sequenced N×0 → N×12 | Finish in **≤ 15 s** |
| **Random** | Table N, shuffled | Finish in **≤ 15 s**, **0 mistakes** |
| **Mixed Review** | All tables 1…N, shuffled | Finish in **≤ 15 s**, **0 mistakes** |

### The unlock ladder

```
Table 1 → In Order ─► Random ─► (Mixed Review = just table 1)
Table 2 → In Order ─► Random ─► Mixed Review (tables 1–2)
Table 3 → In Order ─► Random ─► Mixed Review (tables 1–3)
   ...
Table 12 → In Order ─► Random ─► Mixed Review (tables 1–12)  ◄── "Grand Master"
```

A stage shows as **Locked → Unlocked → Mastered**. Mastering all three stages of
table N unlocks table N+1. Mastered stages can be replayed any time for extra
EXP (with diminishing returns, see §5) and to chase a faster best time.

### Tunable rules (config, not hardcoded)
- Default table range: **1–12** (configurable to 1–9 or 1–10).
- Questions per round: **0–12** (13 questions) — `×0` and `×1` can be toggled off for younger kids.
- Time goal: **15 s** default, adjustable per difficulty profile.
- "No mistakes" applies to Random and Mixed; In Order is speed-only so a first-timer isn't wall-blocked.

These live in a `CurriculumConfig` ScriptableObject so they can be tuned without code changes.

---

## 4. Question, Timing & Scoring Rules

**A round** = one full pass through a stage's question set.

- Timer starts on the **first question shown**, stops on the **last correct answer**.
- **In Order:** a wrong answer shows the correct one and re-asks until right; the clock keeps running (speed is the only gate).
- **Random / Mixed:** a wrong answer fails the "no mistakes" condition. The round still completes (so the child finishes and isn't punished by a hard stop), but it won't count as Mastered — they're prompted to retry.
- **Best time** per stage is stored and shown ("Beat your best: 12.4 s").

**Input method:** number pad (big, tappable). Multiple-choice mode available as an
accessibility / younger-kid option in settings.

### Correct-answer feedback — satisfying, not overwhelming

Getting one right should feel *good* every single time without becoming noisy or
slowing the round down. The target is a quick, juicy "pop" that reads in ~250 ms.

- **The number itself** — pressed key does a snappy scale punch (1.0 → 1.15 → 1.0) with a soft ease; the answer slot fills with a green pulse and a subtle checkmark sweep.
- **A short, light sound** — a clean rising "ding," pitched **up a step per correct answer in a streak** (do → re → mi …) so a flawless run literally plays a little melody. Resets on a miss.
- **A tiny particle burst** — a few sparkles/confetti bits from the answer slot, kept minimal (≤ ~8 particles, quick fade). FX scales down on low-end devices.
- **Haptics** — a light tap (iOS impact-light / Android equivalent), toggleable in settings.
- **The pet** — a quick happy bob/ear-flick, not a full celebration, so reactions don't stack into chaos on fast runs.
- **Streak moments** — every 5th-in-a-row gets a slightly bigger flourish (brief glow + a "+combo" tick) so there's escalation without every answer being a fireworks show.

All of the above are driven by a single `AnswerFeedback` component reading values
from a ScriptableObject, so intensity, sound, and particle count are tunable —
and a **Reduced Motion / calm mode** in settings dials FX and haptics down for
kids who find them distracting.

**Wrong answer:** gentle, non-punishing — a soft shake, a muted low tone, the
correct answer shown briefly; the pet gives an encouraging nudge. Streak melody resets.

---

## 5. EXP & Leveling System

EXP is earned two ways, exactly as requested:

| Action | EXP |
|--------|-----|
| Correct answer | **+1** (×0/×1 questions weighted lower to avoid farming) |
| Stage Mastered (first time) | **+50** |
| Stage replay Mastered | **+10** (diminishing — see below) |
| New table fully mastered | **+100** bonus |
| Speed bonus | up to **+15** scaled by how far under 15 s |
| Flawless streak across a session | small combo multiplier |

**Anti-grind:** replaying an already-mastered stage gives full EXP the first time,
then decays (10 → 5 → 2 → 1) so progress comes from advancing, not repeating ×1.

### Levels
- EXP accumulates into a **player level** with a smooth curve (e.g. `expForLevel(L) = round(100 * L^1.5)`).
- Each level grants **EXP currency** the player spends on the pet (so leveling is the input to the pet, not an automatic result).
- **Milestone levels** (5, 10, 15, 20, …) unlock pet evolution choices.

---

## 6. The Pet (3D Companion)

The emotional hook. One pet per save, fully 3D, rendered live on the home screen.

### First-run: pick your species
On first launch (after a short welcome), the child **chooses their pet species**
from a small lineup of distinct creatures (e.g. dragon, fox-thing, slime, bird,
critter). Each species shares the same evolution *system* (§ milestones below) but
has its own base model, idle animations, and voice flavor, so two kids who pick
differently get genuinely different companions. They then name it. Species is
fixed for that save; a fresh start lets them pick again.

### How it "levels up according to your choice"
At each **milestone level**, the player is offered a **choice node** — a branching
decision that permanently shapes the pet. Choices are cosmetic/identity, never
pay-to-win, so every kid's pet is different.

```
Lv 5   ─►  Element:   🔥 Ember  │  💧 Aqua  │  🌿 Leaf
Lv 10  ─►  Body type: small & quick │ big & sturdy │ floaty
Lv 15  ─►  Feature:   wings │ horns │ extra tail
Lv 20  ─►  Aura/color theme
Lv 25+ ─►  Advanced "robust" forms (see milestones)
```

### Milestone characteristics ("robust sets at milestones")
Milestones don't just add a hat — they unlock **bundled characteristic sets**:
new idle animations, a new reaction set (win/lose/streak), particle effects, a
sound pack (the pet's "voice"), and a richer model variant. The pet visibly
becomes a more capable, expressive creature as the child masters more tables.

| Milestone | Unlocks |
|-----------|---------|
| Hatchling (Lv 1) | Base model, basic idle + happy/sad reactions |
| Lv 5 | First evolution + element choice, element particle FX |
| Lv 10 | Body-type evolution, new animation set, voice pack |
| Lv 15 | Feature choice (wings/horns), celebratory "table mastered" animation |
| Lv 20 | Aura/skin theming, expanded reaction set (combo cheers) |
| Lv 25 | "Robust" adult form — full animation rig, emotes, idle behaviors |
| Lv 30+ | Prestige/legendary variants tied to mastering all 12 tables |

### Technical approach (Expo / React Native)
- **Renderer:** `expo-gl` + `three.js` via **react-three-fiber**, loading **GLB/glTF**
  models with `expo-three`. Animations driven by three.js's `AnimationMixer`.
- **Modular pet rig:** a base mesh with swappable parts/materials so choices combine
  without a combinatorial explosion of full models (body + element + feature + theme).
- **Animation states:** Idle / Happy / Sad / Cheer / Levelup / Sleep, switched on game events.
- **Asset source:** start with a single stylized creature + part variants; GLB meshes can
  come from the `generate_3d` pipeline, then get wired up in three.js.
- Pet config (current parts + unlocked sets) is data, stored in the save file, so the
  pet rebuilds identically on every launch.
- **Performance:** keep poly counts low, bake lighting, cap device pixel ratio, and
  reduce FX on low-end phones. (This is the area where Expo asks more care than Unity would.)

---

## 7. Screens / UX

1. **Home / Pet** — the 3D pet front and center; pet name, player level + EXP bar; big **Play** button; buttons to Map, Pet Lab, Settings.
2. **Adventure Map** — vertical path of tables (1 → 12), each a node showing its three stages and Locked/Unlocked/Mastered state. Tapping a node starts the next stage.
3. **Challenge / Gameplay** — minimal: timer, progress dots (which question of 13), the equation, number pad, the pet reacting in a corner.
4. **Results** — time vs. best, mistakes, EXP earned (animated count-up), Mastered badge, "Next" / "Retry."
5. **Pet Lab** — view the pet, see unlocked sets, make milestone evolution choices, rename, preview future evolutions.
6. **Settings / Parent area** — table range, ×0/×1 toggles, time goal, input mode (number pad vs. multiple choice), sound, and a lightweight parent gate for any sensitive settings.

0. **Onboarding (first run only)** — short welcome → **pick-your-species** lineup → name the pet → straight into Table 1.

**Style:** bright, rounded, friendly; large touch targets; readable for **ages 6–11**;
portrait orientation; works one-handed.

---

## 8. Data Model

```csharp
PlayerProfile {
    string id, petName
    int level, totalExp, spendableExp
    int bestTimeMsByStage[stageKey]   // stageKey = "T3_RANDOM"
    Dictionary<int, TableProgress> tables   // keyed by table number
    PetState pet
    Settings settings
}

TableProgress {
    int tableNumber
    StageState inOrder, random, mixedReview   // Locked | Unlocked | Mastered
}

PetState {
    SpeciesId species               // chosen at first run, fixed for the save
    int stage                       // evolution stage
    Element element                 // Ember | Aqua | Leaf | ...
    BodyType body
    List<FeatureId> features
    ThemeId theme
    HashSet<MilestoneId> unlockedSets
}

Settings {
    int minTable, maxTable
    bool includeZero, includeOne
    int timeGoalMs
    InputMode inputMode             // NumberPad | MultipleChoice
    bool sound, music
}
```

> The data model above is conceptual; the implemented version lives in
> `src/game/types.ts` and `src/state/progress.ts` as TypeScript.

**Persistence:** local-first. Save as JSON via **AsyncStorage** on the device
(in-memory only in Milestone 1; AsyncStorage added in a later milestone). No account
required to play. Optional cloud save and multi-profile support are post-MVP.

---

## 9. Project Structure (Expo / React Native)

```
LuluMath/
├── App.tsx                 Screen state machine (home / challenge / results)
├── index.ts                Expo entry point
├── app.json                Expo config (name, slug, orientation, icons)
├── src/
│   ├── game/               Pure game logic (no React) — testable in isolation
│   │   ├── types.ts        Question, StageConfig, RoundResult
│   │   ├── questions.ts    QuestionGenerator + shuffle + makeStage
│   │   ├── stages.ts       Stage labels, keys, goal text
│   │   └── scoring.ts      Pass/fail rules, EXP, level curve
│   ├── state/
│   │   └── progress.ts     Mastery, best times, EXP, the stage ladder
│   ├── screens/            HomeScreen, ChallengeScreen, ResultsScreen
│   ├── components/         NumberPad, AnswerCard, Sparkles
│   ├── util/               haptics
│   └── theme.ts            Colours, radii, spacing
├── assets/                 App icon, splash
└── DESIGN.md
```

**Key engineering choices**
- **Pure game core:** everything in `src/game/` is plain TypeScript with no React/Expo
  imports, so the rules can be unit-tested and reused regardless of the UI.
- **Built-in `Animated` API** (not Reanimated) for the satisfying feedback — fewer deps,
  no extra Babel config, runs cleanly in Expo Go.
- **Tunable constants** (time goal, EXP values, level curve) live as named exports, ready
  to be promoted to a settings/config object.
- Target **60 fps**; reduced FX / reduced-motion mode on low-end devices.

See **README.md** for how to run it on your phone.

---

## 10. Build Roadmap

**Milestone 0 — Skeleton** ✅
Expo project setup, folder structure, screen navigation (home / challenge / results).

**Milestone 1 — Core gameplay (the math works)** ✅
QuestionGenerator, stage runner, timer, number pad, pass/fail rules, Results screen,
satisfying correct-answer feedback. Table 1 fully playable (In Order → Random) with
placeholder visuals.

**Milestone 2 — Progression**
Full 1–12 ladder, Mixed Review, unlock logic, EXP earning, player levels, Adventure Map.

**Milestone 3 — The pet**
Static 3D pet on Home reacting to events; EXP bar; first evolution at Lv 5; Pet Lab.

**Milestone 4 — Pet depth**
Modular rig, milestone characteristic sets (animations, FX, voice), evolution choices through Lv 25+.

**Milestone 5 — Polish**
Audio, juice/feedback, settings + parent gate, accessibility (multiple choice, larger text), onboarding, balancing.

**Post-MVP:** cloud save, multiple profiles, daily streaks, leaderboards (best times), division/addition modes, more pet species.

---

## 11. Decisions & Open Questions

**Locked in**
- **Pet:** pick-your-species at the start (small lineup, shared evolution system).
- **Age target:** **6–11** — UI scale and reading level tuned for this range.
- **Monetization:** **free** for now (no IAP, no pay-to-progress).
- **Table range:** caps at **12** → "Grand Master" is mastering all of 1–12.
- **Correct-answer feedback:** quick, satisfying "pop" (scale punch + green pulse, rising streak melody, small particle burst, light haptic) with a calm/reduced-motion mode — deliberately not overwhelming.

**Still open**
1. **Species lineup** — how many starters, and which creatures (dragon / fox / slime / bird / critter …)?
2. **Parental dashboard** — is progress reporting for parents in scope, or post-MVP?
3. **×0 / ×1 questions** — include by default for 6–11, or start at ×2 for the youngest?
