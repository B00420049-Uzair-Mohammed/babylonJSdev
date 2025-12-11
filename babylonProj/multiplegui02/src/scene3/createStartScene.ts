// createStartScene.ts (FIXED + CLEANED + MATCHES OTHER SCENES)

import {
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Engine,
  Texture,
  SceneLoader,
  Sound,
} from "@babylonjs/core";

import { bakedAnimations, walk, idle, getAnimating, toggleAnimating } from "./bakedAnimations";
import { keyDownMap, getKeyDown, keyActionManager } from "./keyActionManager";

// -----------------------------------------------------
// AUDIO
// -----------------------------------------------------
function backgroundMusic(scene: Scene): Sound {
  const music = new Sound(
    "music",
    "./assets/audio/arcade-kid.mp3",
    scene,
    null,
    { loop: true, autoplay: true }
  );

  window.addEventListener(
    "click",
    () => {
      if (!music.isPlaying) music.play();
    },
    { once: true }
  );

  return music;
}

// -----------------------------------------------------
// GROUND
// -----------------------------------------------------
function createGround(scene: Scene) {
  const mat = new StandardMaterial("groundMaterial", scene);
  const tex = new Texture("./assets/textures/wood.jpg", scene);
  tex.uScale = tex.vScale = 4;
  mat.diffuseTexture = tex;

  const ground = MeshBuilder.CreateGround("ground", { width: 15, height: 15, subdivisions: 4 }, scene);
  ground.material = mat;
  ground.checkCollisions = true;
  return ground;
}

// -----------------------------------------------------
// CAMERA
// -----------------------------------------------------
function createArcRotateCamera(scene: Scene) {
  const camera = new ArcRotateCamera(
    "camera1",
    -Math.PI / 2,
    Math.PI / 2.5,
    15,
    new Vector3(0, 0, 0),
    scene
  );

  camera.attachControl(true);
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 25;

  return camera;
}

// -----------------------------------------------------
// PLAYER MODEL
// -----------------------------------------------------
async function importPlayer(scene: Scene) {
  const result = await SceneLoader.ImportMeshAsync(
    "",
    "./assets/models/men/",
    "dummy3.babylon",
    scene
  );

  const character = result.meshes[0];
  character.position.set(0, 0.1, 0);
  character.scaling.set(1, 1, 1);
  character.rotation = new Vector3(0, 1.5, 0);
  character.checkCollisions = true;
  character.ellipsoid = new Vector3(0.5, 1, 0.5);

  return result;
}

// -----------------------------------------------------
// MAIN SCENE 3
// -----------------------------------------------------
export default function createStartScene(engine: Engine) {
  const scene = new Scene(engine);
  scene.collisionsEnabled = true;
  scene.gravity = new Vector3(0, -0.3, 0);

  const audio = backgroundMusic(scene);
  const camera = createArcRotateCamera(scene);
  const ground = createGround(scene);

  const box1 = MeshBuilder.CreateBox("box1", { size: 1 }, scene);
  box1.position.set(-1, 4, 1);
  box1.checkCollisions = true;

  const box2 = MeshBuilder.CreateBox("box2", { size: 1 }, scene);
  box2.position.set(-0.7, 8, 1);
  box2.checkCollisions = true;

  // load player once
  const playerPromise = importPlayer(scene);

  playerPromise.then((result) => {
    const character = result.meshes[0];

    // ✅ Initialize baked animations
    const skeleton = result.skeletons[0];
    if (!skeleton) {
      console.error("No skeleton found in imported mesh!");
      return;
    }
    bakedAnimations(scene, skeleton);

    // ✅ Initialize keyboard input after model is ready
    keyActionManager(scene);

    scene.onBeforeRenderObservable.add(() => {
      let movement = Vector3.Zero();
      let moving = false;

      if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
        movement = new Vector3(-0.1, 0, 0);
        character.rotation.y = 3 * Math.PI / 2;
        moving = true;
      }
      if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
        movement = new Vector3(0, 0, -0.1);
        character.rotation.y = Math.PI;
        moving = true;
      }
      if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
        movement = new Vector3(0.1, 0, 0);
        character.rotation.y = Math.PI / 2;
        moving = true;
      }
      if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
        movement = new Vector3(0, 0, 0.1);
        character.rotation.y = 0;
        moving = true;
      }

      character.moveWithCollisions(movement.add(scene.gravity));

      if (getKeyDown()) {
        if (moving && !getAnimating()) {
          walk();
          toggleAnimating();
        }
        if (!moving && getAnimating()) {
          idle();
          toggleAnimating();
        }
      }
    });
  });

  return {
    scene,
    camera,
    player: playerPromise,
    audio,
  };
}
