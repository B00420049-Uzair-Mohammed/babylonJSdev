import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  Light,
  Camera,
  Engine,
  StandardMaterial,
  Texture,
  Color3,
  CubeTexture,
  AbstractMesh,
} from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders"; // Required for .babylon file loading

function createTerrain(scene: Scene) {
  const terrainMat = new StandardMaterial("terrainMat", scene);
  terrainMat.diffuseTexture = new Texture("./assets/environments/valleygrass.png", scene);

  const terrain = MeshBuilder.CreateGroundFromHeightMap(
    "terrain",
    "./assets/environments/villageheightmap.png",
    {
      width: 150,
      height: 150,
      subdivisions: 20,
      minHeight: 0,
      maxHeight: 10,
    },
    scene
  );
  terrain.material = terrainMat;
  terrain.position.y = -0.01;
  return terrain;
}

function createGround(scene: Scene) {
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseTexture = new Texture("./assets/environments/villagegreen.png", scene);
  groundMat.diffuseTexture.hasAlpha = true;
  groundMat.backFaceCulling = false;

  const ground = MeshBuilder.CreateGround("ground", { width: 24, height: 24 }, scene);
  ground.material = groundMat;
  ground.position.y = 0.01;
  return ground;
}

function createSky(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);
  const skyboxMat = new StandardMaterial("skyBoxMat", scene);
  skyboxMat.backFaceCulling = false;
  skyboxMat.reflectionTexture = new CubeTexture("./assets/textures/skybox/skybox", scene);
  skyboxMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMat.diffuseColor = new Color3(0, 0, 0);
  skyboxMat.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMat;
  return skybox;
}

function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(2, 1, 0), scene);
  light.intensity = 0.8;
  light.diffuse = new Color3(1, 1, 1);
  light.specular = new Color3(1, 0.8, 0.8);
  light.groundColor = new Color3(0, 0.2, 0.7);
  return light;
}

function createArcRotateCamera(scene: Scene) {
  const camera = new ArcRotateCamera(
    "camera1",
    -Math.PI / 2,
    Math.PI / 2.5,
    25,
    new Vector3(0, 0, 0),
    scene
  );
  camera.lowerRadiusLimit = 9;
  camera.upperRadiusLimit = 25;
  camera.lowerAlphaLimit = 0;
  camera.upperAlphaLimit = Math.PI * 2;
  camera.lowerBetaLimit = 0;
  camera.upperBetaLimit = Math.PI / 2.02;
  camera.attachControl(true);
  return camera;
}

function loadDummy(scene: Scene): void {
  SceneLoader.ImportMesh(
    "",
    "./assets/models/men/",
    "dummy3.babylon",
    scene,
    (meshes) => {
      const dummy = meshes[0];
      dummy.position = new Vector3(0, 0, 0);
      dummy.scaling = new Vector3(1, 1, 1);
    }
  );
}

export default function createStartScene(engine: Engine) {
  interface SceneData {
    scene: Scene;
    terrain?: Mesh;
    ground?: Mesh;
    sky?: Mesh;
    light?: Light;
    camera?: Camera;
    dummy?: AbstractMesh;
  }

  let that: SceneData = { scene: new Scene(engine) };

  that.terrain = createTerrain(that.scene);
  that.ground = createGround(that.scene);
  that.sky = createSky(that.scene);
  that.light = createLight(that.scene);
  that.camera = createArcRotateCamera(that.scene);
  loadDummy(that.scene);

  return that;
}