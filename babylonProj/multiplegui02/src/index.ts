import { Engine } from "@babylonjs/core";
import createScene1 from "./scene1/createStartScene";
import createScene2 from "./scene2/createStartScene";
import createScene3 from "./scene3/createStartScene";
import createScene4 from "./scene4/createStartScene";
import menuScene from "./gui/guiScene";
import "./main.css";

const CanvasName = "renderCanvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let eng = new Engine(canvas, true);

// --- GLOBALS ---
let scenes: any[] = [];
let currentSceneIndex = 0;

// ---------------- SCENE SWITCHER ---------------------

export default function setSceneIndex(i: number) {
  console.log("Switching to scene:", i);
  currentSceneIndex = i;
}

// -----------------------------------------------------

// GUI (pass callback into menu) - Got From AI - Copilot
let gui = menuScene(eng, setSceneIndex);

// GAME SCENES
scenes[0] = createScene1(eng);
scenes[1] = createScene2(eng);
scenes[2] = createScene3(eng);

// Scene 4 needs data from Scene 1
const sceneData = {
  scene: scenes[0].scene,
  ground: scenes[0].ground,
  terrain: scenes[0].terrain,
  sky: scenes[0].sky,
  lightHemispheric: scenes[0].lightHemispheric,
  camera: scenes[0].camera,
  player: scenes[0].player,
  audio: scenes[0].audio,
};

scenes[3] = createScene4(sceneData, () => {
  setSceneIndex(0);
});

// ---------------- RENDER LOOP ------------------------

eng.runRenderLoop(() => {
  scenes[currentSceneIndex].scene.render();
  gui.scene.autoClear = false;
  gui.scene.render();
});
