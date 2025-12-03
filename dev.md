# Fifth Element - Scene 3 

## Babylon Scene Summary 

### Scene Basics

- A `Scene` object created with the Babylon engine.

```code
export default async function createStartScene3(engine: Engine) {
  const scene = new Scene(engine);
```
- **HemisphericLight** provides ambient illumination.
```code
// ☀️ Light
  new HemisphericLight("light", new Vector3(0, 1, 0), scene);
```
- **ArcRotateCamera** orbits around the origin and is user-controllable.
```code
// 🎥 Camera
  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 3,
    20,
    new Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(true);
```

### Physics 

- Havok physics system engine has been initialized and enabled.
```code
 // ⚙️ Enable Havok physics
  const havokInstance = await HavokPhysics();
  const havokPlugin = new HavokPlugin(true, havokInstance);
  scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);
```
- There is gravity 
- there is collision detection 
- Once collision has occured, the game will end.
```code
// 🧩 Collision Detection (Game Over)
  scene.onBeforeRenderObservable.add(() => {
    scene.meshes.forEach((m) => {
      if ((m.name === "box" || m.name === "ball") && player && player.intersectsMesh(m, false)) {
        console.log("💥 Game Over!");
        restartButton.isVisible = true; // show restart button
      }
    });
  });
```

### Player

- Added a dummy character model ('dummy3.babylon'). 
```code
// 🧍 Player Dummy
  let player: Mesh;
  SceneLoader.ImportMesh("", "./assets/models/men/", "dummy3.babylon", scene, (meshes) => {
    player = meshes[0] as Mesh;
    player.position = new Vector3(0, 1, 0);
    new PhysicsAggregate(player, PhysicsShapeType.CAPSULE, { mass: 1 }, scene);
  });
```
- They have been positioned just slightly above the ground.
```code
player.position = new Vector3(0, 1, 0);
```
- The dummy is controlled via keyboard ('WASD'). 
```code
// 🎮 Player Movement
  const inputMap: { [key: string]: boolean } = {};
  scene.onKeyboardObservable.add((kbInfo) => {
    const key = kbInfo.event.key.toLowerCase();
    inputMap[key] = kbInfo.type === KeyboardEventTypes.KEYDOWN;
  });
```
- Collider with mass was applied 

### Dynamic Objects

- **Boxes**: Wooden-colored cubes spawned periodically with physics bodies.
- **Balls**: White spheres spawned periodically with physics bodies.
```code
// 📦 Wooden Boxes
  function spawnBox() {
    const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
    const mat = new StandardMaterial("boxMat", scene);
    mat.diffuseColor = new Color3(0.6, 0.3, 0.1);
    box.material = mat;
    box.position = new Vector3(Math.random() * 20 - 10, 5, 30);
    new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1 }, scene);
  }

  // ⚽ Balls
  function spawnBall() {
    const ball = MeshBuilder.CreateSphere("ball", { diameter: 1.5 }, scene);
    const mat = new StandardMaterial("ballMat", scene);
    mat.diffuseColor = Color3.White();
    ball.material = mat;
    ball.position = new Vector3(Math.random() * 20 - 10, 5, 30);
    new PhysicsAggregate(ball, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
  }
```
- Both spawn at random x positions and fall into the play area.

### GUI Overlay

- GUI created using the Babylon GUI
```code
 // 🖥️ GUI Overlay
  const gui = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
```
- A restart button has been added.
- The button will appear on collision.
- logic has been added to restart and reload the scene.
```code
const restartButton = Button.CreateSimpleButton("restart", "Restart");
  restartButton.width = "200px";
  restartButton.height = "60px";
  restartButton.color = "white";
  restartButton.background = "red";
  restartButton.fontSize = "24px";
  restartButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  restartButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  restartButton.isVisible = false; // hidden until game over

  restartButton.onPointerUpObservable.add(() => {
    // Reset scene by clearing and reloading
    scene.dispose();
    const newScene = createStartScene3(engine); // reload Scene 3
    engine.runRenderLoop(async () => {
      (await newScene).scene.render();
    });
  });

  gui.addControl(restartButton);
```