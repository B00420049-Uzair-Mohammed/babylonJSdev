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

// Let CSS fully manage the size
canvas.classList.add("babylon-canvas");

// Check canvas size
console.log("Canvas created with id:", canvas.id);
console.log("Initial canvas size (css):", canvas.style.width, canvas.style.height);
console.log("Canvas size (attributes):", canvas.width, canvas.height);

// Create engine
const engine = new Engine(canvas, true);
console.log("Babylon Engine created:", engine);

// Scenes container
const scenes: any[] = [];
let activeSceneIndex = 0;

// Change active scene
export function setSceneIndex(i: number) {
  if (i < 0 || i >= scenes.length) {
    console.warn(`setSceneIndex: Index ${i} out of bounds`);
    return;
  }
  activeSceneIndex = i;
  console.log("Switched to scene", i);
}

// Create GUI (menu overlay)
const gui = menuScene(engine, setSceneIndex);
console.log("GUI Scene created");

// GUI should NOT clear the screen
gui.scene.autoClear = false;
gui.scene.autoClearDepthAndStencil = false;

// Build primary scenes - wrap with async IIFE to await promises if any
(async () => {
  console.log("Creating Scene 1...");
  scenes[0] = await createScene1(engine);
  console.log("Scene 1 created");

  console.log("Creating Scene 2...");
  scenes[1] = await createScene2(engine);
  console.log("Scene 2 created");

  console.log("Creating Scene 3...");
  scenes[2] = await createScene3(engine);
  console.log("Scene 3 created");

  // 3D scenes SHOULD clear the screen
  scenes.forEach((s, i) => {
    if (!s?.scene) {
      console.warn(`Scene ${i} missing 'scene' property`);
      return;
    }
    s.scene.autoClear = true;
    s.scene.autoClearDepthAndStencil = true;
    console.log(`Scene ${i} autoClear set to true`);
  });

  // Prepare Scene 4 (async)
  const base = scenes[2]; // use Scene 3 as base

  // Await player promise if needed
  let player = base.player;
  if (player instanceof Promise) {
    console.log("Awaiting player promise from Scene 3");
    player = await player;
    console.log("Player loaded for Scene 4");
  }

  const sceneDataFor4 = {
    scene: base.scene,
    ground: base.plane,
    terrain: base.terrain,
    sky: base.plane2,
    lightHemispheric: base.light,
    camera: base.camera,
    player,
    audio: base.audio,
  };

  console.log("Creating Scene 4...");
  scenes[3] = await createScene4(sceneDataFor4, () => setSceneIndex(0));
  console.log("Scene 4 created");

  // Scene 4 is a regular 3D scene → should clear normally
  scenes[3].scene.autoClear = true;
  console.log("Scene 4 autoClear set to true");

  // Start the render loop now that all scenes are ready
  engine.runRenderLoop(() => {
    const active = scenes[activeSceneIndex];
    if (!active) {
      console.warn("No active scene found at index", activeSceneIndex);
      return;
    }
    if (!active.scene) {
      console.warn("Active scene object missing 'scene' property");
      return;
    }

    // Log each render frame - be cautious as this logs very frequently
    // Uncomment below if you want verbose frame-by-frame logs
    // console.log(`Rendering scene index ${activeSceneIndex}`);

    active.scene.render();

    gui.scene.render();
  });
})();

// Resize
window.addEventListener("resize", () => {
    console.log("Window resized, engine resizing");
  engine.resize();
});