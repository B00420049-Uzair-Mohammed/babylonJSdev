// src/index.ts
import { Engine } from "@babylonjs/core";

import createScene1 from "./scene1/createStartScene";
import createScene2 from "./scene2/createStartScene";
import createScene3 from "./scene3/createStartScene";
import createScene4 from "./scene4/createStartScene";
import menuScene from "./gui/guiScene";

import "./main.css";

const CanvasName = "renderCanvas";

const canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

const engine = new Engine(canvas, true, {}, true);

// Scenes container
const scenes: any[] = [];
let activeSceneIndex = 0;

// scene switching function exported for other modules if needed
export function setSceneIndex(i: number) {
  if (i < 0 || i >= scenes.length) return;
  activeSceneIndex = i;
  console.log("Switched to scene", i);
}

// Create GUI and pass callback
const gui = menuScene(engine, setSceneIndex);
// keep GUI from clearing the depth buffer / hiding scenes
gui.scene.autoClear = false;
gui.scene.autoClearDepthAndStencil = false;

// Create basic scenes (synchronous constructors)
scenes[0] = createScene1(engine);
scenes[1] = createScene2(engine);
scenes[2] = createScene3(engine);

// Scene 4 expects SceneData from a base scene (we'll supply from scene 0)
// Build a SceneData object matching src/scene4/interfaces.ts (lightweight)
const scene0 = scenes[0];
const sceneDataFor4 = {
  scene: scene0.scene,
  ground: scene0.plane ?? undefined,
  terrain: scene0.terrain ?? undefined,
  sky: scene0.plane2 ?? undefined,
  lightHemispheric: scene0.light ?? undefined,
  camera: scene0.camera ?? undefined,
  player: scene0.player ?? undefined,
  audio: scene0.audio ?? undefined,
};

// createScene4 is async (it initializes Havok). Keep the returned value in scenes[3].
(async () => {
  scenes[3] = await createScene4(sceneDataFor4, () => setSceneIndex(0));
})();

// single render loop
engine.runRenderLoop(() => {
  // render active scene if ready
  const active = scenes[activeSceneIndex];
  if (active && active.scene) {
    active.scene.render();
  }
  // render GUI always on top
  if (gui && gui.scene) {
    gui.scene.render();
  }
});

// resize
window.addEventListener("resize", () => engine.resize());
