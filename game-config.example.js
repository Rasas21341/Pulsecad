/*
  Game configuration example.
  Copy this file to `game-config.js` and edit values to tune difficulty.

  All values are optional — defaults are used when a value is missing.

  For an "easy" setting, use these values. You can set even higher gap or lower speed.
*/

window.GAME_CONFIG = {
  // gravity applied each frame (lower = easier)
  grav: 0.30,
  // flap impulse (negative is upward). larger magnitude = easier
  jump: -1,
  // frames between pipe spawns (higher = fewer pipes)
  spawnRate: 160,
  // base pipe speed (lower = slower pipes = easier)
  speed: 0,
  // vertical gap between top and bottom pipes (larger = easier)
  gap: 220
};
