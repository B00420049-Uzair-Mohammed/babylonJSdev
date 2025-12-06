// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  StandardMaterial,
  Color3,
  Engine,
  KeyboardEventTypes,
} from "@babylonjs/core";

import { HavokPlugin, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";

import HavokPhysics from "@babylonjs/havok";

import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";

import "@babylonjs/loaders";

import {
  AdvancedDynamicTexture,
  Button,
  Control,
  TextBlock,
} from "@babylonjs/gui";

export default async function createStartScene3(engine: Engine) {
  const scene = new Scene(engine);

  // Light
  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Camera
  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 3,
    20,
    new Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(true);

  // Enable Havok physics
  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);
  scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

  // Player Dummy
  let player: Mesh;
  SceneLoader.ImportMesh("", "./assets/models/men/", "dummy3.babylon", scene, (meshes) => {
    player = meshes[0] as Mesh;
    player.position = new Vector3(0, 1, 0);
    new PhysicsAggregate(player, PhysicsShapeType.CAPSULE, { mass: 1 }, scene);
  });

  // Player Movement
  const inputMap: { [key: string]: boolean } = {};
  scene.onKeyboardObservable.add((kbInfo) => {
    const key = kbInfo.event.key.toLowerCase();
    inputMap[key] = kbInfo.type === KeyboardEventTypes.KEYDOWN;
  });

  const moveForce = 5;
  scene.onBeforeRenderObservable.add(() => {
    if (!player) return;
    const body = player.getPhysicsBody();
    if (!body) return;

    if (inputMap["w"]) body.applyImpulse(new Vector3(0, 0, moveForce), player.getAbsolutePosition());
    if (inputMap["s"]) body.applyImpulse(new Vector3(0, 0, -moveForce), player.getAbsolutePosition());
    if (inputMap["a"]) body.applyImpulse(new Vector3(-moveForce, 0, 0), player.getAbsolutePosition());
    if (inputMap["d"]) body.applyImpulse(new Vector3(moveForce, 0, 0), player.getAbsolutePosition());
  });

  // Wooden Boxes
  function spawnBox() {
    const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
    const mat = new StandardMaterial("boxMat", scene);
    mat.diffuseColor = new Color3(0.6, 0.3, 0.1);
    box.material = mat;
    box.position = new Vector3(Math.random() * 20 - 10, 5, 30);
    new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
  }

  // Balls
  function spawnBall() {
    const ball = MeshBuilder.CreateSphere("ball", { diameter: 1.5 }, scene);
    const mat = new StandardMaterial("ballMat", scene);
    mat.diffuseColor = Color3.White();
    ball.material = mat;
    ball.position = new Vector3(Math.random() * 20 - 10, 5, 30);
    new PhysicsAggregate(ball, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
  }

  // Spawning Loop
  let frameCount = 0;
  scene.onBeforeRenderObservable.add(() => {
    frameCount++;
    if (frameCount % 120 === 0) spawnBox();
    if (frameCount % 180 === 0) spawnBall();
  });

  // GUI Overlay
  const gui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  const restartButton = Button.CreateSimpleButton("restart", "Restart");
  restartButton.width = "200px";
  restartButton.height = "60px";
  restartButton.color = "white";
  restartButton.background = "red";
  restartButton.fontSize = "24px";
  restartButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  restartButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  restartButton.isVisible = false; // hidden until game over

  restartButton.onPointerUpObservable.add(() => {
    // Reset scene by clearing and reloading
    scene.dispose();
    const newScene = createStartScene3(engine); // reload Scene 3
    engine.runRenderLoop(async () => {
      (await newScene).scene.render();
    });
  });

  gui.addControl(restartButton);

  // Collision Detection (Game Over)
  scene.onBeforeRenderObservable.add(() => {
    scene.meshes.forEach((m) => {
      if ((m.name === "box" || m.name === "ball") && player && player.intersectsMesh(m, false)) {
        console.log("Game Over!");
        restartButton.isVisible = true; // show restart button
      }
    });
  });

  return { scene, camera };
}