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

  window.addEventListener("click", () => {
    if (!music.isPlaying) music.play();
  }, { once: true });

  return music;
}

// -----------------------------------------------------
// MAIN GROUND
// -----------------------------------------------------
function createGround(scene: Scene) {
  const mat = new StandardMaterial("groundMaterial", scene);
  const tex = new Texture("./assets/textures/wood.jpg", scene);
  tex.uScale = tex.vScale = 4;
  mat.diffuseTexture = tex;

  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 15, height: 15, subdivisions: 4 },
    scene
  );

  ground.material = mat;
  ground.checkCollisions = true;
  return ground;
}

// -----------------------------------------------------
// ARENA
// -----------------------------------------------------
function createArenaGround(scene: Scene) {
  const mat = new StandardMaterial("arenaGroundMat", scene);
  const tex = new Texture("./assets/textures/wood.jpg", scene);
  tex.uScale = tex.vScale = 4;
  mat.diffuseTexture = tex;

  const arena = MeshBuilder.CreateGround(
    "arenaGround",
    { width: 60, height: 60, subdivisions: 4 },
    scene
  );

  arena.material = mat;
  arena.position.y = -0.02;
  arena.checkCollisions = true;

  return arena;
}

// -----------------------------------------------------
// LIGHT
// -----------------------------------------------------
function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 1.1;
  return light;
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
// PLAYER
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
  character.rotation = new Vector3(0, 1.5, 0);
  character.checkCollisions = true;
  character.ellipsoid = new Vector3(0.5, 1, 0.5);

  return result;
}

// -----------------------------------------------------
// PUSHABLE + FALLING BOX
// -----------------------------------------------------
function createPushableBox(scene: Scene, startPos: Vector3, mass = 1) {
  const mesh = MeshBuilder.CreateBox("pushBox", { size: 1 }, scene);
  mesh.position.copyFrom(startPos);
  mesh.checkCollisions = true;

  return {
    mesh,
    velocity: new Vector3(0, 0, 0),
    mass,
  };
}

// -----------------------------------------------------
// MAIN SCENE
// -----------------------------------------------------
export default function createStartScene(engine: Engine) {
  const scene = new Scene(engine);
  scene.collisionsEnabled = true;

  // Light, audio, camera
  const light = createLight(scene);
  const audio = backgroundMusic(scene);
  const camera = createArcRotateCamera(scene);

  // Ground layers
  const ground = createGround(scene);
  const arena = createArenaGround(scene);

  // Falling + pushable objects
  const fallingObjects = [
    createPushableBox(scene, new Vector3(-1, 5, 1), 1),
    createPushableBox(scene, new Vector3(-0.7, 8, 1), 1.2),
  ];

  // Physics constants
  const gravity = -0.03;
  const groundY = 0;
  const pushForce = 0.06;
  const friction = 0.90;

  // Player
  const playerPromise = importPlayer(scene);

  playerPromise.then((result) => {
    const character = result.meshes[0];
    const skeleton = result.skeletons[0];

    bakedAnimations(scene, skeleton);
    keyActionManager(scene);

    // -----------------------------------------------------
    // GAME LOOP
    // -----------------------------------------------------
    scene.onBeforeRenderObservable.add(() => {

      // ---------- PLAYER MOVEMENT ----------
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

      character.moveWithCollisions(movement);

      // ---------- PUSHABLE BOX + FALLING PHYSICS ----------
      fallingObjects.forEach((obj) => {

        // GRAVITY
        if (obj.mesh.position.y > groundY + 0.5) {
          obj.velocity.y += gravity;
        } else {
          obj.velocity.y = 0;
          obj.mesh.position.y = groundY + 0.5;
        }

        // PLAYER PUSHES BOX
        if (obj.mesh.intersectsMesh(character)) {
          const pushDir = obj.mesh.position.subtract(character.position).normalize();
          obj.velocity.x += pushDir.x * (pushForce / obj.mass);
          obj.velocity.z += pushDir.z * (pushForce / obj.mass);
        }

        // MOVE BOX
        obj.mesh.moveWithCollisions(obj.velocity);

        // FRICTION
        obj.velocity.x *= friction;
        obj.velocity.z *= friction;

        // Stop micro jitter
        if (Math.abs(obj.velocity.x) < 0.001) obj.velocity.x = 0;
        if (Math.abs(obj.velocity.z) < 0.001) obj.velocity.z = 0;

        // Falling box knocks player away
        if (
          obj.mesh.position.y > groundY + 0.6 &&
          obj.mesh.intersectsMesh(character)
        ) {
          const dir = character.position.subtract(obj.mesh.position).normalize();
          character.moveWithCollisions(dir.scale(0.12));
        }
      });

      // ---------- Animation ----------
      if (getKeyDown()) {
        if (moving && !getAnimating()) {
          walk();
          toggleAnimating();
        } else if (!moving && getAnimating()) {
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
    light,
    ground,
  };
}
