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
  Nullable,
  Vector4,
  InstancedMesh,
  SpriteManager,
  Sprite
} from "@babylonjs/core";

// ------------------------------------------------------------
// Terrain
// ------------------------------------------------------------

function createTerrain(scene: Scene) {
  const mat = new StandardMaterial("terrainMat", scene);
  mat.diffuseTexture = new Texture("./assets/environments/valleygrass.png", scene);

  const terrain = MeshBuilder.CreateGroundFromHeightMap(
    "terrain",
    "./assets/environments/villageheightmap.png",
    {
      width: 150,
      height: 150,
      subdivisions: 40,
      minHeight: 0,
      maxHeight: 10
    },
    scene
  );

  terrain.material = mat;
  terrain.position.y = -0.05;

  return terrain;
}

// ------------------------------------------------------------
// Grass ground around village
// ------------------------------------------------------------

function createGround(scene: Scene) {
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseTexture = new Texture("./assets/environments/villagegreen.png", scene);
  groundMat.diffuseTexture.hasAlpha = true;
  groundMat.backFaceCulling = false;

  const ground = MeshBuilder.CreateGround("ground", { width: 24, height: 24 }, scene);
  ground.material = groundMat;
  ground.position.y = 0.02;
  return ground;
}

// ------------------------------------------------------------
// Skybox
// ------------------------------------------------------------

function createSky(scene: Scene) {
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 150 }, scene);

  const skyMat = new StandardMaterial("skyMat", scene);
  skyMat.backFaceCulling = false;

  // FIX: use cube texture prefix, not a single file
  skyMat.reflectionTexture = new CubeTexture(
    "./assets/environments/skybox/skybox",
    scene
  );

  skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyMat.diffuseColor = new Color3(0, 0, 0);
  skyMat.specularColor = new Color3(0, 0, 0);

  skybox.material = skyMat;
  return skybox;
}

// ------------------------------------------------------------
// House Builder
// ------------------------------------------------------------

function createBox(style: number) {
  const mat = new StandardMaterial("boxMat");
  const faceUV: Vector4[] = [];

  if (style === 1) {
    mat.diffuseTexture = new Texture("./assets/textures/cubehouse.png");
    faceUV[0] = new Vector4(0.5, 0.0, 0.75, 1.0);
    faceUV[1] = new Vector4(0.0, 0.0, 0.25, 1.0);
    faceUV[2] = new Vector4(0.25, 0, 0.5, 1.0);
    faceUV[3] = new Vector4(0.75, 0, 1.0, 1.0);
  } else {
    mat.diffuseTexture = new Texture("./assets/textures/semihouse.png");
    faceUV[0] = new Vector4(0.6, 0.0, 1.0, 1.0);
    faceUV[1] = new Vector4(0.0, 0.0, 0.4, 1.0);
    faceUV[2] = new Vector4(0.4, 0, 0.6, 1.0);
    faceUV[3] = new Vector4(0.4, 0, 0.6, 1.0);
  }

  const box = MeshBuilder.CreateBox("box", {
    width: style,
    height: 1,
    faceUV,
    wrap: true
  });

  box.position.y = 0.5;
  box.material = mat;
  return box;
}

function createRoof(style: number) {
  const roof = MeshBuilder.CreateCylinder("roof", {
    diameter: 1.3,
    height: 1.2,
    tessellation: 3
  });

  roof.scaling.x = 0.75;
  roof.scaling.y = style * 0.85;
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 1.22;

  const mat = new StandardMaterial("roofMat");
  mat.diffuseTexture = new Texture("./assets/textures/roof.jpg");
  roof.material = mat;

  return roof;
}

function createHouse(scene: Scene, style: number) {
  const box = createBox(style);
  const roof = createRoof(style);

  return Mesh.MergeMeshes([box, roof], true, true, undefined, false, true)!;
}

function createHouses(scene: Scene, style: number) {
  if (style === 1) {
    createHouse(scene, 1);
    return;
  }

  if (style === 2) {
    createHouse(scene, 2);
    return;
  }

  if (style === 3) {
    // estate mode
    const originals: Mesh[] = [];
    originals[0] = createHouse(scene, 1);
    originals[1] = createHouse(scene, 2);

    originals[0].position.set(-6.8, 0, 2.5);
    originals[1].position.set(-4.5, 0, 3);

    const placements: Array<[number, number, number, number]> = [
      [2, -Math.PI / 16, -1.5, 4],
      [2, -Math.PI / 3, 1.5, 6],
      [2, (15 * Math.PI) / 16, -6.4, -1.5],
      [1, (15 * Math.PI) / 16, -4.1, -1],
      [2, (15 * Math.PI) / 16, -2.1, -0.5],
      [1, (5 * Math.PI) / 4, 0, -1],
      [1, Math.PI + Math.PI / 2.5, 0.5, -3],
      [2, Math.PI + Math.PI / 2.1, 0.75, -5],
      [1, Math.PI + Math.PI / 2.25, 0.75, -7],
      [2, Math.PI / 1.9, 4.75, -1],
      [1, Math.PI / 1.95, 4.5, -3],
      [2, Math.PI / 1.9, 4.75, -5],
      [1, Math.PI / 1.9, 4.75, -7],
      [2, -Math.PI / 3, 5.25, 2],
      [1, -Math.PI / 3, 6, 4]
    ];

    placements.forEach((p, i) => {
      const base = originals[p[0] - 1];
      const inst = base.createInstance("house" + i);
      inst.rotation.y = p[1];
      inst.position.set(p[2], 0, p[3]);
    });
  }
}

// ------------------------------------------------------------
// Trees
// ------------------------------------------------------------

function createTrees(scene: Scene) {
  const sprites = new SpriteManager(
    "trees",
    "./assets/sprites/tree.png",
    2000,
    { width: 512, height: 1024 },
    scene
  );

  // distribute around perimeter
  for (let i = 0; i < 900; i++) {
    const s = new Sprite("tree", sprites);

    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 40;

    s.position.x = Math.cos(angle) * radius;
    s.position.z = Math.sin(angle) * radius;
    s.position.y = 0;
  }
}

// ------------------------------------------------------------
// Light & Camera
// ------------------------------------------------------------

function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(2, 1, 0), scene);
  light.intensity = 0.9;
  return light;
}

function createCamera(scene: Scene) {
  const cam = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    25,
    Vector3.Zero(),
    scene
  );

  cam.lowerRadiusLimit = 9;
  cam.upperRadiusLimit = 28;

  cam.attachControl(scene.getEngine().getRenderingCanvas(), true);

  return cam;
}

// ------------------------------------------------------------

export default function createStartScene(engine: Engine) {
  const scene = new Scene(engine);

  const terrain = createTerrain(scene);
  const ground = createGround(scene);
  const sky = createSky(scene);

  createHouses(scene, 3);
  createTrees(scene);

  const light = createLight(scene);
  const camera = createCamera(scene);

  return {
    scene,
    terrain,
    ground,
    sky,
    lightHemispheric: light,
    camera,
    player: undefined,
    audio: undefined
  };
}
