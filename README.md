# 🚫 TABOO! — The Party Word-Guessing Webapp

A modern, fully functional, ultra-responsive web application of the classic party game **Taboo**! Get your team to guess the secret word on the card without uttering any of the 5 forbidden Taboo words before the timer expires.

![Taboo Game](https://img.shields.io/badge/Taboo-Party%20Game-orange?style=for-the-badge)
![Cards](https://img.shields.io/badge/Cards-320%2B%20Curated-blue?style=for-the-badge)
![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API-emerald?style=for-the-badge)

---

## ⚡ Quick Start

### Option 1: Open Directly in Any Web Browser
Simply double-click [`index.html`](file:///Users/abhay/.gemini/antigravity/scratch/taboo-game/index.html) or drag it into Chrome, Safari, Firefox, or Edge. No build step or installation required!

### Option 2: Run the Built-in Python Server
```bash
cd /Users/abhay/.gemini/antigravity/scratch/taboo-game
python3 server.py
```
Then visit **`http://localhost:8000`** on your computer or phone on the same Wi-Fi network!

---

## 🎮 Key Features

1. **320+ Authentic, High-Quality Cards**:
   - Spanning 6 diverse categories:
     - 🎒 *Everyday Objects & Life*
     - 🍕 *Food, Drink & Cuisine*
     - 🎬 *Pop Culture, Movies & Music*
     - 🚀 *Science, Technology & Nature*
     - 🌍 *Geography, Travel & World*
     - 🧠 *Brain Busters & Abstract Concepts*
   - Filter by specific category or play with the full combined deck.
   - Fisher-Yates shuffle engine ensures zero card repetitions until deck exhaustion.

2. **Web Audio API Synthesizer (100% Offline)**:
   - **Correct Chime:** Sparkling two-tone ascending bell.
   - **Taboo Buzzer:** Authentic grating dual-oscillator square-wave party buzzer!
   - **Timer Ticking:** Woodblock clock tick in the final 10 seconds.
   - **Warning Beeps:** Urgent dual-tone beeps for the final 5 seconds.
   - **Time's Up Horn:** Referee buzzer ending the round.
   - **Victory Fanfare:** Triumphant arpeggiated brass chime on match point.
   - **Haptic Vibration:** Tactile vibration pulses on mobile devices (`navigator.vibrate`).

3. **Pass & Play Handoff Screen**:
   - Prevents guessers from seeing the card before the turn begins.
   - Turn announcement, current scores, and a smooth **3-2-1 Countdown Overlay** to get the clue giver ready.

4. **Dynamic Circular Progress Timer**:
   - Visual SVG ring countdown that shifts from emerald green (>40%) to amber (>15%) to urgent pulsing red (<15%).
   - Pause button stops the timer and blurs/hides the card to prevent peeking.

5. **Post-Round Review & "Dispute Room"**:
   - Solves the #1 frustration of party word games: accidental misclicks or disputed fouls!
   - Shows every card played in the turn with instant toggle buttons (`Correct +1`, `Taboo -1`, `Skip 0`).
   - Automatically recalculates the net turn score before confirming.

6. **Custom Card Builder & Deck Manager**:
   - Create your own cards with target word + 5 taboo words + category.
   - **Export / Import JSON:** Share custom decks with friends (e.g., inside jokes, company trivia, family memories).
   - Saved persistently in browser `localStorage`.

7. **Standalone Referee Buzzer Pad**:
   - Giant 3D red buzzer button with realistic physical press animation. Perfect for an opponent watching the clue giver's shoulder!

8. **Keyboard Shortcuts for Desktop**:
   - `Spacebar` or `Right Arrow`: **Correct** (+1 pt)
   - `B` or `Down Arrow`: **Taboo / Buzzer** (-1 pt)
   - `S` or `Left Arrow`: **Skip / Pass** (0 pt)
   - `P` or `Escape`: **Pause / Resume**

---

## 📜 How to Play Taboo

1. **Split into Teams:** Divide players into 2 to 4 teams (e.g., Team Orange vs. Team Blue).
2. **Assign the Clue Giver:** Teams take turns having one member give clues to their teammates.
3. **The Watcher:** An opponent sits or stands beside the Clue Giver to watch the card.
4. **Give Clues:** The Clue Giver describes the target word at the top without saying:
   - The **Target Word** itself (or derivatives/forms).
   - Any of the **5 Taboo words** listed below it.
   - No rhymes with, "sounds like", gestures, sounds, or abbreviations.
5. **Score Points:**
   - Teammates guess correctly: tap **CORRECT** (+1 pt).
   - Clue giver slips and says a Taboo word: watcher taps **TABOO BUZZER** (-1 pt).
   - Stuck on a tough word: tap **SKIP**.
6. **Win the Game:** First team to reach the target score (or highest score after fixed rounds) wins with a confetti victory celebration!

---

## 📁 Project Structure

```
taboo-game/
├── index.html         # Master game UI and screens
├── css/
│   └── styles.css     # Responsive mobile-first stylesheet & animations
├── js/
│   ├── cards.js       # 320+ card database + custom deck storage
│   ├── audio.js       # Web Audio API synthesizers (chimes, buzzers, horns)
│   ├── confetti.js    # 60fps canvas particle confetti engine
│   └── app.js         # Complete game engine, state machine & dispute room
├── server.py          # Zero-config local Python HTTP server
└── README.md          # Documentation & game rules
```
