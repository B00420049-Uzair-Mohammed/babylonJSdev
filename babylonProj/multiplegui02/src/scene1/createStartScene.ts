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
} from "@babylonjs/core";

// -------------------- HELPERS --------------------

function createGround(scene: Scene) {
  const ground = MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
  const mat = new StandardMaterial("groundMat", scene);
  mat.diffuseColor = new Color3(0.1, 1, 0.5);
  ground.material = mat;
  return ground;
}

function createSphere(scene: Scene) {
  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1, segments: 32 }, scene);
  sphere.position.y = 0.5;

  const mat = new StandardMaterial("sphereMat", scene);
  mat.emissiveTexture = new Texture("./src/assets/textures/lavatile.jpg", scene);
  sphere.material = mat;
  return sphere;
}

function createBox(scene: Scene) {
  const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
  box.position.set(-1.5, 0.5, 1.5);

  const mat = new StandardMaterial("boxMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/reflectivity.jpg", scene);
  box.material = mat;
  return box;
}

function createCylinder(scene: Scene) {
  const cylinder = MeshBuilder.CreateCylinder("cylinder", { height: 1, diameter: 0.7 }, scene);
  cylinder.position.set(1.5, 0.5, 1.5);

  const mat = new StandardMaterial("cylMat", scene);
  mat.diffuseTexture = new Texture("./src/assets/textures/wood.jpg", scene);
  cylinder.material = mat;
  return cylinder;
}

function createCone(scene: Scene) {
  const cone = MeshBuilder.CreateCylinder(
    "cone",
    { height: 1, diameterBottom: 0.7, diameterTop: 0 },
    scene
  );
  cone.position.set(1.5, 0.5, -1.5);

  const mat = new StandardMaterial("coneMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/reflectivity.jpg", scene);
  cone.material = mat;
  return cone;
}

function createTriangle(scene: Scene) {
  const tri = MeshBuilder.CreateCylinder("triangle", { height: 1, diameter: 0.7, tessellation: 3 }, scene);
  tri.position.set(-1.5, 0.5, -1.5);

  const mat = new StandardMaterial("triMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/reflectivity.jpg", scene);
  tri.material = mat;
  return tri;
}

function createCapsule(scene: Scene) {
  const capsule = MeshBuilder.CreateCapsule(
    "capsule",
    { radius: 0.35, height: 1, radiusTop: 0.1 },
    scene
  );
  capsule.position.set(-1.5, 1.5, -1.5);

  const mat = new StandardMaterial("capMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/reflectivity.jpg", scene);
  mat.diffuseColor = new Color3(1, 0.6, 0.6);
  capsule.material = mat;
  return capsule;
}

function createTorus(scene: Scene) {
  const torus = MeshBuilder.CreateTorus(
    "torus",
    { diameter: 0.7, thickness: 0.3, tessellation: 16 },
    scene
  );

  torus.position.set(-1.5, 1.5, 1.5);

  const mat = new StandardMaterial("torusMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/reflectivity.jpg", scene);
  mat.diffuseColor = new Color3(0.6, 0.6, 1);
  torus.material = mat;
  return torus;
}

function createTube(scene: Scene) {
  const path = [new Vector3(0.8, -0.2, 0.8), new Vector3(0.3, 0.4, 0.3)];

  const tube = MeshBuilder.CreateTube("tube", { path, radius: 0.2 }, scene);

  const mat = new StandardMaterial("tubeMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/reflectivity.jpg", scene);
  tube.material = mat;
  return tube;
}

function createExtrusion(scene: Scene) {
  const shape = [
    new Vector3(0, 0.7), new Vector3(0.2, 0.2), new Vector3(0.7, 0),
    new Vector3(0.2, -0.2), new Vector3(0, -0.7), new Vector3(-0.2, -0.2),
    new Vector3(-0.7, 0), new Vector3(-0.2, 0.2),
  ];

  const path = [new Vector3(0.75, -0.75, -0.2), new Vector3(0.75, -0.75, -1.2)];

  const extr = MeshBuilder.ExtrudeShape(
    "star",
    { shape, path, closeShape: true },
    scene
  );

  const mat = new StandardMaterial("extrMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/reflectivity.jpg", scene);
  extr.material = mat;
  return extr;
}

function createOctahedron(scene: Scene) {
  const oct = MeshBuilder.CreatePolyhedron("oct", { type: 1, size: 0.5 }, scene);
  oct.position.set(0, 2, 0);

  const mat = new StandardMaterial("octMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/reflectivity.jpg", scene);
  oct.material = mat;
  return oct;
}

function createPlane(scene: Scene) {
  const plane = MeshBuilder.CreatePlane("plane", { size: 3 }, scene);
  plane.position.y = 1.8;

  const mat = new StandardMaterial("planeMat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/wood.jpg", scene);
  plane.material = mat;
  return plane;
}

function createPlane2(scene: Scene) {
  const plane = MeshBuilder.CreatePlane("plane2", { size: 3 }, scene);
  plane.position.y = 1.8;
  plane.rotation.y = Math.PI / 2;

  const mat = new StandardMaterial("plane2Mat", scene);
  mat.ambientTexture = new Texture("./src/assets/textures/wood.jpg", scene);
  plane.material = mat;
  return plane;
}

function createLight(scene: Scene) {
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;
  return light;
}

function createCamera(scene: Scene) {
  const cam = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.3,
    12,
    new Vector3(0, 0.5, 0),
    scene
  );

  cam.attachControl(scene.getEngine().getRenderingCanvas(), true);
  return cam;
}

// -------------------------------------------------

export default function createStartScene(engine: Engine) {
  const scene = new Scene(engine);

  return {
    scene,
    ground: createGround(scene),
    sphere: createSphere(scene),
    box: createBox(scene),
    cylinder: createCylinder(scene),
    cone: createCone(scene),
    triangle: createTriangle(scene),
    capsule: createCapsule(scene),
    torus: createTorus(scene),
    tube: createTube(scene),
    extrusion: createExtrusion(scene),
    octahedron: createOctahedron(scene),
    plane: createPlane(scene),
    plane2: createPlane2(scene),
    light: createLight(scene),
    camera: createCamera(scene),
  };
}
