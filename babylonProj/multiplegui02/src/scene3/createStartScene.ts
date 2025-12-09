import {
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  HemisphericLight,
  Color3,
  Engine,
  Texture,
  SceneLoader,
  AbstractMesh,
  ISceneLoaderAsyncResult,
  Sound,
  Mesh,
} from "@babylonjs/core";

// --- external helpers for animation state ---
import { walk, idle, getAnimating, toggleAnimating } from "./bakedAnimations";
import { keyDownMap, getKeyDown, keyDownHeld } from "./keyActionManager";

// ------------------ AUDIO ------------------
function backgroundMusic(scene: Scene): Sound {
  let music = new Sound("music", "./assets/audio/arcade-kid.mp3", scene, null, {
    loop: true,
    autoplay: true,
  });

  Engine.audioEngine!.useCustomUnlockedButton = true;

  // Unlock audio on first user interaction.
  window.addEventListener(
    "click",
    () => {
      if (!Engine.audioEngine!.unlocked) {
        Engine.audioEngine!.unlock();
      }
    },
    { once: true }
  );
  return music;
}

// ------------------ GROUND ------------------
function createGround(scene: Scene) {
  const groundMaterial = new StandardMaterial("groundMaterial");
  const groundTexture = new Texture("./assets/textures/wood.jpg");
  groundTexture.uScale = 4.0;
  groundTexture.vScale = 4.0;
  groundMaterial.diffuseTexture = groundTexture;
  groundMaterial.diffuseTexture.hasAlpha = true;
  groundMaterial.backFaceCulling = false;

  let ground = MeshBuilder.CreateGround(
    "ground",
    { width: 15, height: 15, subdivisions: 4 },
    scene
  );
  ground.material = groundMaterial;
  ground.checkCollisions = true; // enable collisions
  return ground;
}

// ------------------ LIGHT ------------------
function createHemisphericLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(2, 1, 0), scene);
  light.intensity = 0.7;
  light.diffuse = new Color3(1, 1, 1);
  light.specular = new Color3(1, 0.8, 0.8);
  light.groundColor = new Color3(0, 0.2, 0.7);
  return light;
}

// ------------------ CAMERA ------------------
function createArcRotateCamera(scene: Scene) {
  let camAlpha = -Math.PI / 2,
    camBeta = Math.PI / 2.5,
    camDist = 15,
    camTarget = new Vector3(0, 0, 0);
  let camera = new ArcRotateCamera(
    "camera1",
    camAlpha,
    camBeta,
    camDist,
    camTarget,
    scene
  );
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 25;
  camera.lowerAlphaLimit = 0;
  camera.upperAlphaLimit = Math.PI * 2;
  camera.lowerBetaLimit = 0;
  camera.upperBetaLimit = Math.PI / 2.02;

  camera.attachControl(true);

  // enable collisions for camera
  camera.checkCollisions = true;

  return camera;
}

// ------------------ BOXES ------------------
function createBox1(scene: Scene) {
  let box = MeshBuilder.CreateBox("box1", { width: 1, height: 1 }, scene);
  box.position.set(-1, 4, 1);

  var texture = new StandardMaterial("reflective", scene);
  texture.ambientTexture = new Texture("./assets/textures/reflectivity.png", scene);
  texture.diffuseColor = new Color3(1, 1, 1);
  box.material = texture;

  box.checkCollisions = true;
  return box;
}

function createBox2(scene: Scene) {
  let box = MeshBuilder.CreateBox("box2", { width: 1, height: 1 }, scene);
  box.position.set(-0.7, 8, 1);

  var texture = new StandardMaterial("reflective", scene);
  texture.ambientTexture = new Texture("./assets/textures/reflectivity.png", scene);
  texture.diffuseColor = new Color3(1, 1, 1);
  box.material = texture;

  box.checkCollisions = true;
  return box;
}

// ------------------ PLAYER ------------------
function importMeshA(scene: Scene, x: number, y: number) {
  let item: Promise<void | ISceneLoaderAsyncResult> = SceneLoader.ImportMeshAsync(
    "",
    "./assets/models/men/",
    "dummy3.babylon",
    scene
  );

  item.then((result) => {
    let character: AbstractMesh = result!.meshes[0];
    character.position.set(x, y + 0.1, 0);
    character.scaling = new Vector3(1, 1, 1);
    character.rotation = new Vector3(0, 1.5, 0);

    // enable collisions
    character.checkCollisions = true;
    character.ellipsoid = new Vector3(0.5, 1, 0.5);
  });

  return item;
}

// ------------------ MAIN SCENE ------------------
export default function createStartScene(engine: Engine) {
  let scene = new Scene(engine);
  scene.collisionsEnabled = true; // global collisions

  let audio = backgroundMusic(scene);
  let lightHemispheric = createHemisphericLight(scene);
  let camera = createArcRotateCamera(scene);
  let box1 = createBox1(scene);
  let box2 = createBox2(scene);
  let player = importMeshA(scene, 0, 0);
  let ground = createGround(scene);

  // --- Character control + animation loop ---
  scene.onBeforeRenderObservable.add(() => {
    player.then((result) => {
      let character = result!.meshes[0];
      let moveVector = Vector3.Zero();
      let characterMoving = false;

      if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
        moveVector = new Vector3(-0.1, 0, 0);
        character.rotation.y = (3 * Math.PI) / 2;
        characterMoving = true;
      }
      if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
        moveVector = new Vector3(0, 0, -0.1);
        character.rotation.y = Math.PI;
        characterMoving = true;
      }
      if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
        moveVector = new Vector3(0.1, 0, 0);
        character.rotation.y = Math.PI / 2;
        characterMoving = true;
      }
      if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
        moveVector = new Vector3(0, 0, 0.1);
        character.rotation.y = 0;
        characterMoving = true;
      }

      // move with collisions
      character.moveWithCollisions(moveVector);

      // animation state
      if (getKeyDown() && character) {
        if (characterMoving) {
          walk();
        } else {
          idle();
        }
      }
    });
  });
  return { scene: scene, player: player, audio: audio };
}