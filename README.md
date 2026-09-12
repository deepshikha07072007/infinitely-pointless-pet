# 🐾 Mochi — The Infinitely Pointless Pet

A single-file, no-dependency virtual pet you can poke, feed, play with, and talk to. Built entirely with HTML, CSS, and vanilla JavaScript — no libraries, no build step, no server. Just open `index.html` in a browser.

## Quick start

1. Download `index.html`.
2. Open it in any modern browser (Chrome, Safari, Firefox, Edge).
3. That's it — no install, no server needed.

Everything (score, happiness, pet type, color, dark mode, sound setting) is saved to your browser's `localStorage`, so it picks up where you left off next time you open the file.

## Features

### Core interactions
| Action | Effect |
|---|---|
| **Click** the pet | Pets it — plays a sound, squishes, spawns particles, increments score & combo, occasionally shows a reaction message |
| **Drag** the pet | Stretches toward your cursor like taffy, then springs back |
| **Double-click** | Triggers "zoomies" — a big particle/heart burst, chord of sounds, +10 score with combo multiplier |
| **Scroll** | Cycles the bow through 6 colors |

### Customization (🎨 button)
- **Pet type**: Cat, Dog, Bunny, Bear — each with distinct ear shapes, tail, nose, and whether it has whiskers
- **Fur color**: White, Black, Ginger, Grey, Brown, Pink, plus a secret **Golden** color unlocked at 150 score
- Selection is remembered across visits

### Care actions (bottom bar)
- **🍖 Treat** — tosses a treat that arcs into the pet's mouth; boosts happiness and score
- **🧶 Play** — throws a yarn ball the pet chases; boosts happiness and score
- **Talk** — type anything and hit Enter/Talk; the pet "speaks" it back in a squeaky voice using the browser's built-in speech synthesis, with its mouth animated in sync and a speech bubble showing the text

### Emotional states (automatic, based on time and happiness)
- 😺 **Content** — default
- 😻 **Happy** — sparkly eyes, faster tail wag, when happiness is high
- 😑 **Bored** — after ~10s with no interaction: swaying head, half-lidded glancing eyes, flat mouth, a tapping paw, and rotating thought bubbles ("💭 so booored", "💭 entertain me?")
- 😴 **Sleepy** — after ~25s idle: curls up, eyes close, tail stops, "💤" bubbles float up. Interacting again gives it a startled "!" wake-up
- 🥺 **Hungry** — when the happiness meter runs low

### Score system
- **Score** — increases with every interaction, multiplied by the current **combo**
- **Combo** — climbs the faster you click, resets after ~1.4s of no clicking
- **Best** — highest score reached, persisted locally
- **Happy** — a 0–100% meter that slowly decays over time and rises from petting, treats, play, and talking; it drives whether the pet gets bored/sleepy/hungry

### Other bonuses
- 🌙 **Dark mode** toggle
- 🔊 **Mute** toggle for all sound effects (synthesized live with the Web Audio API — no audio files)
- ↺ **Reset** button for score/combo
- ✨ **Golden easter egg** — reach 150 score to permanently unlock a golden color option

## How it's built

- **No frameworks, no assets.** Everything — the pet's face, ears, tail, particles, hearts — is drawn with CSS shapes (`border-radius`, `clip`-style triangles via borders, gradients, and animations).
- **Sound** is generated on the fly with the Web Audio API (oscillators + gain envelopes) — meows, purrs, treat-chomping, yawns, etc. — so there are no audio files to load.
- **Speech** for the Talk feature uses the browser's native `SpeechSynthesisUtterance` API, pitched up for a cartoonish voice.
- **Persistence** uses `localStorage` for score, best score, happiness, pet type, color, dark mode, and mute state.
- **Single file**: all HTML, CSS, and JS live in `index.html` for maximum portability.

## Browser support

Works in any modern evergreen browser. The Talk feature depends on `speechSynthesis` support (available in all major desktop and mobile browsers); if unavailable, the pet still shows the speech bubble and animates its mouth without audio.

## License

Do whatever you want with it — it's a toy.
