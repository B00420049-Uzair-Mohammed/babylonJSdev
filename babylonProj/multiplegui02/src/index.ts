// src/index.ts
import { Engine } from "@babylonjs/core";

import createScene1 from "./scene1/createStartScene";
import createScene2 from "./scene2/createStartScene";
import createScene3 from "./scene3/createStartScene";
import createScene4 from "./scene4/createStartScene";
import menuScene from "./gui/guiScene";

import "./main.css";

const CanvasName = "renderCanvas";

// Create one canvas
const canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

// Create engine
const engine = new Engine(canvas, true);

// Scenes container
const scenes: any[] = [];
let activeSceneIndex = 0;

// Change active scene
export function setSceneIndex(i: number) {
  if (i < 0 || i >= scenes.length) return;
  activeSceneIndex = i;
  console.log("Switched to scene", i);
}

// Create GUI (menu overlay)
const gui = menuScene(engine, setSceneIndex);

// GUI should NOT clear the screen
gui.scene.autoClear = false;
gui.scene.autoClearDepthAndStencil = false;

// Build primary scenes
scenes[0] = createScene1(engine);
scenes[1] = createScene2(engine);
scenes[2] = createScene3(engine);

// 3D scenes SHOULD clear the screen
scenes.forEach((s) => {
  if (!s?.scene) return;
  s.scene.autoClear = true;
  s.scene.autoClearDepthAndStencil = true;
});

// Prepare Scene 4 (async)
const base = scenes[0];

const sceneDataFor4 = {
  scene: base.scene,
  ground: base.plane,
  terrain: base.terrain,
  sky: base.plane2,
  lightHemispheric: base.light,
  camera: base.camera,
  player: base.player,
  audio: base.audio,
};

(async () => {
  const scene4 = await createScene4(sceneDataFor4, () => setSceneIndex(0));

  // Scene 4 is a regular 3D scene → should clear normally
  scene4.scene.autoClear = true;

  scenes[3] = scene4;
})();

// ------------------------------------------------------
// Render Loop (correct order)
// ------------------------------------------------------
engine.runRenderLoop(() => {
  const active = scenes[activeSceneIndex];

  // 1. Render the active 3D scene (background)
  if (active?.scene) {
    active.scene.render();
  }

  // 2. Render GUI (overlay on top)
  gui.scene.render();
});

// Resize
window.addEventListener("resize", () => engine.resize());
