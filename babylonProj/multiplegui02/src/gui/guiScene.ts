import {
  Scene,
  ArcRotateCamera,
  Vector3,
  Camera,
  Engine
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

//----------------------------------------------------

function createSceneButton(
  scene: Scene,
  name: string,
  label: string,
  sceneIndex: number,
  x: string,
  y: string,
  advtex: GUI.AdvancedDynamicTexture,
  setSceneCallback: (i: number) => void
) {
  let button = GUI.Button.CreateSimpleButton(name, label);
  button.left = x;
  button.top = y;
  button.width = "80px";
  button.height = "30px";
  button.color = "white";
  button.cornerRadius = 20;
  button.background = "purple";

  button.onPointerUpObservable.add(() => {
    console.log(`Menu clicked → switch to scene ${sceneIndex}`);
    setSceneCallback(sceneIndex);
  });

  advtex.addControl(button);
  return button;
}

function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2;
  let camBeta = Math.PI / 2.5;
  let camDist = 10;
  let camTarget = new Vector3(0, 0, 0);

  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );

  camera.attachControl(false);
  return camera;
}

//----------------------------------------------------

export default function menuScene(
  engine: Engine,
  setSceneCallback: (i: number) => void
) {
  let scene = new Scene(engine);
  let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("menuUI");

  let button1 = createSceneButton(scene, "but1", "1", 0, "-150px", "120px", advancedTexture, setSceneCallback);
  let button2 = createSceneButton(scene, "but2", "2", 1, "-50px", "120px", advancedTexture, setSceneCallback);
  let button3 = createSceneButton(scene, "but3", "3", 2, "50px", "120px", advancedTexture, setSceneCallback);
  let button4 = createSceneButton(scene, "but4", "4", 3, "150px", "120px", advancedTexture, setSceneCallback);

  let camera = createArcRotateCamera(scene);

  return {
    scene,
    advancedTexture,
    button1,
    button2,
    button3,
    button4,
    camera
  };
}
