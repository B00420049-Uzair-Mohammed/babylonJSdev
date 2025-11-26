import { Engine } from "@babylonjs/core";
import createStartScene from "./createStartScene";
import './main.css';
import {createCharacterController} from "./createCharacterController";
import { gui } from "./gui";

const CanvasName = "renderCanvas";

let canvas = document.createElement("canvas");
canvas.id = CanvasName;

canvas.classList.add("background-canvas");
document.body.appendChild(canvas);

let eng = new Engine(canvas, true, {}, true);

(async function main() {
    const startScene = await createStartScene(eng);
    createCharacterController(startScene.scene);
    gui(startScene.scene);
    eng.runRenderLoop(() => {
        startScene.scene.render();
    });
})();
