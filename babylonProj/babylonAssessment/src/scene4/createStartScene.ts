// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  DirectionalLight,
  MeshBuilder,
  Mesh,
  Engine,
  StandardMaterial,
  Color3,
  ShadowGenerator,
} from "@babylonjs/core";

export default function createStartScene4(engine: Engine) {
  const scene = new Scene(engine);

  // Camera
  const camera = new ArcRotateCamera(
    "camera4",
    -Math.PI / 2,
    Math.PI / 3,
    20,
    new Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(true);

  // Lighting
  const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.5;

  const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, -1), scene);
  dirLight.position = new Vector3(10, 10, 10);

  // Shadows
  const shadowGenerator = new ShadowGenerator(1024, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  // Box
  const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
  box.position = new Vector3(-3, 1, 0);
  const boxMat = new StandardMaterial("boxMat", scene);
  boxMat.diffuseColor = new Color3(0.2, 0.6, 1); // blue
  box.material = boxMat;
  shadowGenerator.addShadowCaster(box);

  // Sphere
  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
  sphere.position = new Vector3(3, 1, 0);
  const sphereMat = new StandardMaterial("sphereMat", scene);
  sphereMat.diffuseColor = new Color3(1, 0.3, 0.3); // red
  sphere.material = sphereMat;
  shadowGenerator.addShadowCaster(sphere);

  // Ground
  const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.8, 0.8, 0.8); // light grey
  ground.material = groundMat;
  ground.receiveShadows = true;

  // Cylinder
  const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameter: 1.5, height: 3 }, scene);
  cylinder.position = new Vector3(0, 1.5, 3);
  const cylMat = new StandardMaterial("cylMat", scene);
  cylMat.diffuseColor = new Color3(0.3, 1, 0.3); // green
  cylinder.material = cylMat;
  shadowGenerator.addShadowCaster(cylinder);

  return { scene, camera };
}