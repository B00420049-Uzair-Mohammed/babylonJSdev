// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  ArcRotateCamera,
  KeyboardEventTypes,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

export default function createPickupScene(engine: Engine) {
  const scene = new Scene(engine);

  // Environment
  new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);

  // Dummy
  const dummy = MeshBuilder.CreateCapsule("dummy", { height: 2, radius: 0.5 }, scene);
  dummy.position.y = 1;

  // Camera
  const camera = new ArcRotateCamera("cam", -Math.PI / 2, Math.PI / 3, 6, dummy.position, scene);
  camera.attachControl(true);
  scene.onBeforeRenderObservable.add(() => {
    camera.target = dummy.position.clone();
  });

  // Movement
  const inputMap: { [key: string]: boolean } = {};
  scene.onKeyboardObservable.add((kbInfo) => {
    const key = kbInfo.event.key.toLowerCase();
    inputMap[key] = kbInfo.type === KeyboardEventTypes.KEYDOWN;
  });

  const speed = 0.1;
  scene.onBeforeRenderObservable.add(() => {
    if (inputMap["w"]) dummy.position.z += speed;
    if (inputMap["s"]) dummy.position.z -= speed;
    if (inputMap["a"]) dummy.position.x -= speed;
    if (inputMap["d"]) dummy.position.x += speed;
  });

  // Create Pickups
  const pickups: Mesh[] = [];
  const pickupMaterial = new StandardMaterial("pickupMat", scene);
  pickupMaterial.diffuseColor = Color3.Yellow();

  for (let i = 0; i < 5; i++) {
    const item = MeshBuilder.CreateSphere(`pickup${i}`, { diameter: 1 }, scene);
    item.position = new Vector3(
      Math.random() * 16 - 8,
      0.5,
      Math.random() * 16 - 8
    );
    item.material = pickupMaterial;
    pickups.push(item);
  }

  // Pickup Detection
  scene.onBeforeRenderObservable.add(() => {
    pickups.forEach((item, index) => {
      if (!item.isDisposed() && dummy.intersectsMesh(item, false)) {
        item.dispose(); // remove from scene
        console.log(`Picked up item ${index}`);
      }
    });
  });

  return scene;
}