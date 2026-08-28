import { Game, type HudRefs } from "./game/game.ts";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const hud: HudRefs = {
  livesEl: document.getElementById("lives")!,
  killsEl: document.getElementById("kills")!,
  endScreenEl: document.getElementById("endScreen")!,
  endMessageEl: document.getElementById("endMessage")!,
};

const game = new Game(canvas, hud);
game.start();
