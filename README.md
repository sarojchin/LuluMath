# LuluMath

A multiplication training game for kids (ages 6–11), built with **React Native + Expo (TypeScript)**.

Master each times table by beating the clock — earn EXP for every answer and every
table you finish, and (soon) grow a 3D pet that evolves as you learn.

See **[DESIGN.md](./DESIGN.md)** for the full game design.

---

## What's built so far (Milestone 1)

- **Table 1 fully playable:** *In Order* → *Random*.
- **Timed mastery:** finish in 15 s (Random also needs **no mistakes**) to master a stage.
- **Number pad** input with a running timer and progress dots.
- **Satisfying correct-answer feedback:** scale punch + green flash + a small sparkle
  burst, a rising "🔥 streak" counter, and escalating haptics — tuned to feel good
  without being overwhelming.
- **EXP + levels:** points per correct answer, a mastery bonus, and a speed bonus,
  with an animated EXP count-up on the results screen.

> Progress is in-memory for now (resets when you reload). Saving to the device,
> tables 2–12, and the 3D pet come in later milestones.

---

## ▶️ Run it on your phone (no Xcode, no Android SDK)

This is the easy path — it works on iPhone **and** Android, from any Mac/Windows/Linux
computer, using the free **Expo Go** app. No build, no developer account.

### 1. One-time setup on your computer

You need **Node.js 18+**. Check with `node --version`. If you don't have it, install
the LTS from <https://nodejs.org>.

### 2. One-time setup on your phone

Install **Expo Go**:
- **iPhone:** App Store → search "Expo Go".
- **Android:** Play Store → search "Expo Go".

Make sure your **phone and computer are on the same Wi-Fi network**.

### 3. Start the project

From this folder:

```bash
npm install      # first time only
npm start        # starts the Expo dev server and shows a QR code
```

### 4. Open it

- **iPhone:** open the **Camera** app, point it at the QR code in your terminal, tap the banner.
- **Android:** open **Expo Go** → "Scan QR code" → scan the QR code.

The app loads on your phone. **Edit a file, save, and it reloads instantly** — that's
the whole iteration loop.

> **If the QR code won't connect** (common on restricted or guest Wi-Fi), run with a
> tunnel instead — it routes through Expo's servers and works across networks:
> ```bash
> npx expo start --tunnel
> ```

---

## Try it in your browser (quickest sanity check)

```bash
npm run web
```

Opens in a browser. Good for a fast look, though haptics don't fire on web and touch
feel is best on a real phone.

---

## Project layout

```
App.tsx          screen navigation (home / challenge / results)
src/game/        pure game logic — questions, stages, scoring (no UI, unit-testable)
src/state/       progress: mastery, best times, EXP, the stage ladder
src/screens/     Home, Challenge, Results
src/components/  NumberPad, AnswerCard, Sparkles
src/util/        haptics
src/theme.ts     colours, spacing
```

## Scripts

| Command | What it does |
|---------|--------------|
| `npm start` | Start the Expo dev server (QR code for Expo Go) |
| `npm run web` | Run in a browser |
| `npm run android` / `npm run ios` | Open directly on a connected device/emulator |
| `npx tsc --noEmit` | Type-check the project |
