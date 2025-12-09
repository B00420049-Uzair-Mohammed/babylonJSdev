import { Engine } from "@babylonjs/core";
import createScene1  from "./scene1/createStartScene";
import createScene2  from "./scene2/createStartScene";
import createScene3  from "./scene3/createStartScene";
import createScene4  from "./scene4/createStartScene";
import menuScene from "./gui/guiScene";
import "./main.css";

const CanvasName = "renderCanvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;

canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let scene;
let scenes: any[] = [];

let eng = new Engine(canvas, true, {}, true);
let gui = menuScene(eng);
scenes[0] = createScene1(eng);
scenes[1] = createScene2(eng);
scenes[2] = createScene3(eng);
// Create a SceneData object for createScene4
const sceneData = {
    scene: scenes[0].scene,
    ground: scenes[0].ground,
    terrain: scenes[0].terrain,
    sky: scenes[0].sky,
    lightHemispheric: scenes[0].lightHemispheric,
    camera: scenes[0].camera,
    player: scenes[0].player,
    audio: scenes[0].audio,
    // Add other required properties here as needed
};
scenes[3] = createScene4(sceneData, () => {});
scene = scenes[0].scene;
setSceneIndex(0);

export default function setSceneIndex(i: number) {
  eng.runRenderLoop(() => {
      scenes[i].scene.render();
      gui.scene.autoClear = false;
      gui.scene.render();
  });
}