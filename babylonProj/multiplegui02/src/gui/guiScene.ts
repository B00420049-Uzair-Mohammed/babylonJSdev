// src/gui/guiScene.ts
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  Engine,
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export default function menuScene(
  engine: Engine,
  setSceneCallback: (i: number) => void
) {
  const scene = new Scene(engine);
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("menuUI");

  function makeButton(label: string, index: number, left: string) {
    const b = GUI.Button.CreateSimpleButton("btn" + label, label);
    b.width = "80px";
    b.height = "36px";
    b.color = "white";
    b.background = "#6a3fa0";
    b.cornerRadius = 12;
    b.left = left;
    b.top = "120px";
    b.onPointerUpObservable.add(() => {
      setSceneCallback(index);
    });
    advancedTexture.addControl(b);
    return b;
  }

  makeButton("1", 0, "-150px");
  makeButton("2", 1, "-50px");
  makeButton("3", 2, "50px");
  makeButton("4", 3, "150px");

  // small GUI camera so inspector/debugging works if needed
  const camera = new ArcRotateCamera(
    "guiCam",
    -Math.PI / 2,
    Math.PI / 2.5,
    5,
    new Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(false);

  return { scene, advancedTexture, camera };
}
