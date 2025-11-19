# FlapThing

A small Flappy Bird–style web game. Open `index.html` in a browser to play.

Controls:
- Press Space to flap
- Click or Tap the canvas to flap

Files:
- `index.html` — main page
- `style.css` — simple styles
- `script.js` — game logic (Canvas)

To run locally:
1. Open the `flapthing` folder.
2. Double-click `index.html` (or serve the folder with a static server).

Want sound, sprites, mobile scaling, or a different name? Tell me which and I'll add it.

Google Sign-In and Live Scores
- To enable Google Sign-In and live score sync you must create a Firebase project and add a file named `firebase-config.js` in the `flapthing` folder that defines `window.FIREBASE_CONFIG` (see `firebase-config.example.js`).
- After adding `firebase-config.js`, open `index.html`. Click "Sign in with Google" and approve the account.
- Scores are saved under `flapthing/scores` in the Firebase Realtime Database; the admin panel will display global best and player count.

- Game configuration
- You can tune difficulty without editing `script.js` by creating a `game-config.js` in the `flapthing` folder. Copy `game-config.example.js` to `game-config.js` and change values.
- The example file uses an "easy" preset (lower gravity, bigger gap, slower pipes).

Admin Login
- Click the "admin login" word at the bottom-right.
- Use username: `admin` and password: `flapmaster2025` to view and reset the best score (stored locally and optionally in Firebase when configured).

