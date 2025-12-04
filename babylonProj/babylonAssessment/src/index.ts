import { Engine } from "@babylonjs/core";
import createScene1 from "./scene1/createStartScene";
import createScene2 from "./scene2/createStartScene";
import createScene3 from "./scene3/createStartScene";
import createScene4 from "./scene4/createStartScene";
import createMainMenuScene from "./gui/guiScene"; // renamed for clarity
import "./main.css";

const CanvasName = "renderCanvas";

// Create canvas
let canvas = document.createElement("canvas");
canvas.id = CanvasName;
canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

// Engine
let eng = new Engine(canvas, true, {}, true);

// Scenes array
// -1 will represent the menu scene
let scenes: any = {};
scenes[-1] = createMainMenuScene(eng, setSceneIndex); // pass setSceneIndex into menu
scenes[0] = createScene1(eng);
scenes[1] = createScene2(eng);
scenes[2] = createScene3(eng);
scenes[3] = createScene4(eng);

// Start at menu
setSceneIndex(-1);

export default function setSceneIndex(i: number) {
  eng.runRenderLoop(() => {
    if (i === -1) {
      // Render menu scene
      scenes[-1].render();
    } else {
      // Render one of the game scenes
      scenes[i].scene.render();
    }
  });
}