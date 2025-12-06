import { SceneData } from "./interfaces";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  Mesh,
  StandardMaterial,
  HemisphericLight,
  Color3,
  Engine,
  Texture,
  CubeTexture,
  AbstractMesh,
  ISceneLoaderAsyncResult,
  Sound,
  SceneLoader,
} from "@babylonjs/core";

// -------------------- ENVIRONMENT --------------------

function createTerrain(scene: Scene) {
  const mat = new StandardMaterial("largeGroundMat", scene);
  mat.diffuseTexture = new Texture("./assets/environments/valleygrass.png", scene);

  const ground = MeshBuilder.CreateGroundFromHeightMap(
    "largeGround",
    "./assets/environments/villageheightmap.png",
    { width: 150, height: 150, subdivisions: 20, minHeight: 0, maxHeight: 10 },
    scene
  );
  ground.material = mat;
  ground.position.y = -0.01;
  return ground;
}

function createGround(scene: Scene) {
  const mat = new StandardMaterial("groundMaterial", scene);
  mat.diffuseTexture = new Texture("./assets/environments/villagegreen.png", scene);
  mat.diffuseTexture.hasAlpha = true;
  mat.backFaceCulling = false;

  const ground = MeshBuilder.CreateGround("ground", { width: 24, height: 24 }, scene);
  ground.material = mat;
  ground.position.y = 0.01;
  return ground;
}

function createSky(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
  const mat = new StandardMaterial("skyBox", scene);
  mat.backFaceCulling = false;
  mat.reflectionTexture = new CubeTexture("./assets/textures/skybox/skybox", scene);
  mat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  mat.diffuseColor = new Color3(0, 0, 0);
  mat.specularColor = new Color3(0, 0, 0);
  skybox.material = mat;
  return skybox;
}

function createHemisphericLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(2, 1, 0), scene);
  light.intensity = 0.8;
  light.diffuse = new Color3(1, 1, 1);
  light.specular = new Color3(1, 0.8, 0.8);
  light.groundColor = new Color3(0, 0.2, 0.7);
  return light;
}

function createArcRotateCamera(scene: Scene) {
  const camera = new ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.5, 25, new Vector3(0, 0, 0), scene);
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 25;
  camera.lowerAlphaLimit = 0;
  camera.upperAlphaLimit = Math.PI * 2;
  camera.lowerBetaLimit = 0;
  camera.upperBetaLimit = Math.PI / 2.02;
  camera.attachControl(true);
  return camera;
}

// -------------------- PLAYER + AUDIO --------------------

function importPlayer(scene: Scene, x: number, y: number) {
  return SceneLoader.ImportMeshAsync("", "./assets/models/men/", "dummy3.babylon", scene).then((result) => {
    const character: AbstractMesh = result.meshes[0];
    character.position.set(x, y + 0.1, 0);
    character.scaling = new Vector3(1, 1, 1);
    character.rotation = new Vector3(0, 1.5, 0);
    return result;
  });
}

function backgroundMusic(scene: Scene): Sound {
  const music = new Sound("music", "./assets/audio/arcade-kid.mp3", scene, null, { loop: true, autoplay: true });
  Engine.audioEngine!.useCustomUnlockedButton = true;
  window.addEventListener("click", () => {
    if (!Engine.audioEngine!.unlocked) Engine.audioEngine!.unlock();
  }, { once: true });
  return music;
}

// -------------------- MAIN --------------------

export default function createStartScene(engine: Engine) {
  const scene = new Scene(engine);

  const ground = createGround(scene);
  const terrain = createTerrain(scene);
  const sky = createSky(scene);
  const lightHemispheric = createHemisphericLight(scene);
  const camera = createArcRotateCamera(scene);

  const player = importPlayer(scene, 0, 0);
  const audio = backgroundMusic(scene);

  let that: SceneData = {
    scene,
    ground,
    terrain,
    sky,
    lightHemispheric,
    camera,
    player,
    audio,
  };

  return that;
}