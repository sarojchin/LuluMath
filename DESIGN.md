# LuluMath — Multiplication Training Game

**Design document v0.1**
Platform: iOS + Android phone app · Engine: Unity (C#)

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

**Feedback:** immediate — green pulse + chime on correct, gentle shake + the right
answer on wrong. The pet animates to reactions (cheers on a streak, encourages on a miss).

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

### Technical approach (Unity)
- **Modular pet rig:** a base skeleton with swappable mesh/material parts so choices
  combine without a combinatorial explosion of full models. (Body + element +
  feature + theme = layered parts on one rig.)
- **State machine (Animator):** Idle / Happy / Sad / Cheer / Levelup / Sleep, driven by game events.
- **Rendered with URP** (Universal Render Pipeline) for good mobile performance.
- **Asset source:** start with a single stylized creature + part variants; the
  `generate_3d` / asset pipeline can produce GLB meshes that get rigged in-engine.
- Pet config (current parts + unlocked sets) is data, stored in the save file, so the
  pet rebuilds identically on every launch.

---

## 7. Screens / UX

1. **Home / Pet** — the 3D pet front and center; pet name, player level + EXP bar; big **Play** button; buttons to Map, Pet Lab, Settings.
2. **Adventure Map** — vertical path of tables (1 → 12), each a node showing its three stages and Locked/Unlocked/Mastered state. Tapping a node starts the next stage.
3. **Challenge / Gameplay** — minimal: timer, progress dots (which question of 13), the equation, number pad, the pet reacting in a corner.
4. **Results** — time vs. best, mistakes, EXP earned (animated count-up), Mastered badge, "Next" / "Retry."
5. **Pet Lab** — view the pet, see unlocked sets, make milestone evolution choices, rename, preview future evolutions.
6. **Settings / Parent area** — table range, ×0/×1 toggles, time goal, input mode (number pad vs. multiple choice), sound, and a lightweight parent gate for any sensitive settings.

**Style:** bright, rounded, friendly; large touch targets; readable for ages ~6–11;
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

**Persistence:** local-first. Save as JSON (e.g. via `JsonUtility` or Newtonsoft)
in `Application.persistentDataPath`. No account required to play. Optional cloud
save (iCloud / Google Play Games) and multi-profile support are post-MVP.

---

## 9. Project Structure (Unity)

```
LuluMath/
├── Assets/
│   ├── Scenes/            Home, Map, Challenge, Results, PetLab
│   ├── Scripts/
│   │   ├── Core/          GameManager, SaveSystem, AudioManager, SceneRouter
│   │   ├── Curriculum/    QuestionGenerator, StageRunner, Timer, ScoreRules
│   │   ├── Progression/   ProgressTracker, UnlockLogic, ExpSystem, LevelCurve
│   │   ├── Pet/           PetController, PetRig, PetAnimator, EvolutionChoices
│   │   ├── UI/            screen controllers, NumberPad, ExpBar, MapNode
│   │   └── Data/          PlayerProfile, PetState, ScriptableObject configs
│   ├── Prefabs/           Pet parts, UI widgets, map nodes
│   ├── Art/               Models, materials, textures, animations
│   ├── Audio/             SFX, music, pet voice packs
│   └── Config/            CurriculumConfig, ExpConfig, PetConfig (ScriptableObjects)
├── Packages/              URP, Input System, etc.
├── ProjectSettings/
└── DESIGN.md
```

**Key engineering choices**
- **ScriptableObjects** for all tunable data (curriculum, EXP, pet sets) → designers tune without recompiling.
- **Event-driven:** an `EventBus` connects gameplay → EXP → pet reactions, keeping systems decoupled.
- **URP** + texture atlasing + modular pet parts for mobile performance.
- **New Input System** for clean touch handling.
- Target **60 fps**; pet LOD / reduced FX on low-end devices.

---

## 10. Build Roadmap

**Milestone 0 — Skeleton**
Project setup (URP, folders, scenes), SaveSystem, navigation between empty screens.

**Milestone 1 — Core gameplay (the math works)**
QuestionGenerator, StageRunner, timer, number pad, pass/fail rules, Results screen.
Table 1 fully playable (In Order → Random) with placeholder visuals.

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

## 11. Open Questions

1. **Pet art direction** — one signature creature, or pick-your-species at the start?
2. **Table range** — cap at 12, or go to 10? Affects "Grand Master" pacing.
3. **Monetization** — fully free, one-time purchase, or cosmetic-only IAP? (No pay-to-progress, per pillar 4.)
4. **Age target** — narrowing to ~6–9 vs ~6–11 changes UI scale and reading level.
5. **Parental dashboard** — is progress reporting for parents in scope?
