// scene4/createStartScene.ts
import { SceneData } from "./interfaces";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  Vector4,
  MeshBuilder,
  Mesh,
  StandardMaterial,
  Texture,
  HemisphericLight,
  Color3,
  SpriteManager,
  Sprite,
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

import {
  keyActionManager,
  keyDownMap,
  getKeyDown,
} from "./keyActionManager";

import {
  bakedAnimations,
  walk,
  run,
  idle,
  getAnimating,
  toggleAnimating,
} from "./bakedAnimations";

import { SceneLoader, AbstractMesh, Skeleton } from "@babylonjs/core";

// ---------------------------
// TERRAIN / GROUND / SKY
// ---------------------------
function createTerrain(scene: Scene) {
  const mat = new StandardMaterial("terrainMat", scene);
  mat.diffuseTexture = new Texture("./assets/environments/valleygrass.png", scene);

  const terrain = MeshBuilder.CreateGroundFromHeightMap(
    "terrain",
    "./assets/environments/villageheightmap.png",
    { width: 150, height: 150, subdivisions: 40, minHeight: 0, maxHeight: 10 },
    scene
  );
  terrain.material = mat;
  terrain.position.y = -0.05;
  terrain.checkCollisions = true;
  return terrain;
}

function createGround(scene: Scene) {
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseTexture = new Texture("./assets/environments/villagegreen.png", scene);
  groundMat.diffuseTexture.hasAlpha = true;
  groundMat.backFaceCulling = false;

  const ground = MeshBuilder.CreateGround("ground", { width: 24, height: 24 }, scene);
  ground.material = groundMat;
  ground.position.y = 0.02;
  ground.checkCollisions = true;
  return ground;
}

function createSky(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
  const skyMat = new StandardMaterial("skyMat", scene);
  skyMat.backFaceCulling = false;
  skyMat.reflectionTexture = new Texture("./assets/environments/skybox.png", scene);
  skyMat.reflectionTexture.coordinatesMode = 2; // SKYBOX_MODE
  skyMat.diffuseColor = new Color3(0, 0, 0);
  skyMat.specularColor = new Color3(0, 0, 0);
  skybox.material = skyMat;
  return skybox;
}

// ---------------------------
// HOUSES
// ---------------------------
function createBox(style: number, scene: Scene) {
  const mat = new StandardMaterial("boxMat", scene);
  const faceUV: Vector4[] = [];
  if (style === 1) {
    mat.diffuseTexture = new Texture("./assets/textures/cubehouse.png");
  } else {
    mat.diffuseTexture = new Texture("./assets/textures/semihouse.png");
  }

  const box = MeshBuilder.CreateBox("box", { width: style, height: 1, faceUV, wrap: true }, scene);
  box.position.y = 0.5;
  box.checkCollisions = true;
  box.material = mat;
  return box;
}

function createRoof(style: number, scene: Scene) {
  const roof = MeshBuilder.CreateCylinder("roof", { diameter: 1.3, height: 1.2, tessellation: 3 }, scene);
  roof.scaling.x = 0.75;
  roof.scaling.y = style * 0.85;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;

  const mat = new StandardMaterial("roofMat", scene);
  mat.diffuseTexture = new Texture("./assets/textures/roof.jpg");
  roof.material = mat;
  roof.checkCollisions = true;

  return roof;
}

function createHouse(scene: Scene, style: number) {
  const box = createBox(style, scene);
  const roof = createRoof(style, scene);
  return Mesh.MergeMeshes([box, roof], true, true, undefined, false, true)!;
}

function createHouses(scene: Scene) {
  // simple village
  for (let i = 0; i < 10; i++) {
    const style = Math.random() > 0.5 ? 1 : 2;
    const house = createHouse(scene, style);
    house.position.set(Math.random() * 20 - 10, 0, Math.random() * 20 - 10);
  }
}

// ---------------------------
// TREES
// ---------------------------
function createTrees(scene: Scene) {
  const sprites = new SpriteManager(
    "trees",
    "./assets/sprites/tree.png",
    2000,
    { width: 512, height: 1024 },
    scene
  );

  for (let i = 0; i < 200; i++) {
    const s = new Sprite("tree", sprites);
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 30;
    s.position.x = Math.cos(angle) * radius;
    s.position.z = Math.sin(angle) * radius;
    s.position.y = 0;
  }
}

// ---------------------------
// LIGHT
// ---------------------------
function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(2, 1, 0), scene);
  light.intensity = 0.9;
  return light;
}

// ---------------------------
// CREATE SCENE4
// ---------------------------
export default async function createRunScene(
  startScene: SceneData,
  restartScene: () => void
) {
  const engine = startScene.scene.getEngine();
  const scene4 = new Scene(engine);
  scene4.collisionsEnabled = true;

  // CAMERA
  const camera = new ArcRotateCamera(
    "camera4",
    -Math.PI / 2,
    Math.PI / 2.5,
    25,
    Vector3.Zero(),
    scene4
  );
  camera.attachControl(true);
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 28;

  // KEY INPUT
  keyActionManager(scene4);

  // TERRAIN / GROUND / SKY / HOUSES / TREES
  createTerrain(scene4);
  createGround(scene4);
  createSky(scene4);
  createHouses(scene4);
  createTrees(scene4);

  // LIGHT
  createLight(scene4);

  // GUI
  const gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("runUI", true);
  function showGameOverOverlay() {
    const text = new GUI.TextBlock();
    text.text = "GAME OVER";
    text.color = "white";
    text.fontSize = 52;
    text.top = "-140px";
    gui.addControl(text);

    const btn = GUI.Button.CreateSimpleButton("restartBtn", "Restart");
    btn.width = "200px";
    btn.height = "70px";
    btn.color = "white";
    btn.background = "#d9534f";
    btn.onPointerUpObservable.add(() => {
      gui.dispose();
      restartScene();
    });
    gui.addControl(btn);
  }

  // ---------------------------
  // IMPORT PLAYER
  // ---------------------------
  const result = await SceneLoader.ImportMeshAsync(
    "",
    "./assets/models/men/",
    "dummy3.babylon",
    scene4
  );

  const character = result.meshes[0] as AbstractMesh;
  const skeleton = result.skeletons?.[0] as Skeleton | undefined;

  if (!skeleton) console.error("[Scene4] Skeleton not found");
  else bakedAnimations(scene4, skeleton);

  character.checkCollisions = true;
  character.ellipsoid = new Vector3(0.5, 1, 0.5);``
  character.ellipsoidOffset = new Vector3(0, 1, 0);
  character.position = new Vector3(0, 1, 0);

  // PLAYER MOVEMENT LOOP
  scene4.onBeforeRenderObservable.add(() => {
    let movement = new Vector3(0, 0, 0);``
    let moving = false;
    const speed = keyDownMap["Shift"] ? 0.2 : 0.1;

    if (keyDownMap["w"]) { movement.z -= speed; character.rotation.y = Math.PI; moving = true; }
    if (keyDownMap["s"]) { movement.z += speed; character.rotation.y = 0; moving = true; }
    if (keyDownMap["a"]) { movement.x -= speed; character.rotation.y = -Math.PI/2; moving = true; }
    if (keyDownMap["d"]) { movement.x += speed; character.rotation.y = Math.PI/2; moving = true; }

    character.moveWithCollisions(movement);

    // Animation
    if (skeleton) {
      if (moving && !getAnimating()) { speed > 0.1 ? run() : walk(); toggleAnimating(); }
      else if (!moving && getAnimating()) { idle(); toggleAnimating(); }
    }
  });

  return {
    scene: scene4,
    camera,
    player: result,
    audio: startScene.audio,
  };
}
