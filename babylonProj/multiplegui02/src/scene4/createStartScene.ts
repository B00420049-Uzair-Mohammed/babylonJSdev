import { SceneData } from "./interfaces";
import {
  AbstractMesh,
  Skeleton,
  Vector3,
  PhysicsAggregate,
  PhysicsShapeType,
  HavokPlugin,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Camera,
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

import { keyActionManager, keyDownMap, keyDownHeld, getKeyDown } from "./keyActionManager";
import { bakedAnimations, walk, run, idle, getAnimating, toggleAnimating } from "./bakedAnimations";
import HavokPhysics from "@babylonjs/havok";

export default async function createRunScene(
  runScene: SceneData,
  restartScene: () => void
) {

  // ---------------------------------------------------
  //  PHYSICS INITIALIZATION
  // ---------------------------------------------------
  const havokInstance = await HavokPhysics();
  const hk = new HavokPlugin(true, havokInstance);

  runScene.scene.enablePhysics(new Vector3(0, -9.8, 0), hk);
  keyActionManager(runScene.scene);

  // ---------------------------------------------------
  //  GUI OVERLAY SETUP
  // ---------------------------------------------------
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("runUI");

  function showGameOverOverlay() {
    const text = new GUI.TextBlock();
    text.text = "GAME OVER";
    text.color = "white";
    text.fontSize = 48;
    text.top = "-120px";
    advancedTexture.addControl(text);

    const btn = GUI.Button.CreateSimpleButton("restartBtn", "Restart");
    btn.width = "180px";
    btn.height = "60px";
    btn.color = "white";
    btn.background = "#d9534f";
    btn.onPointerUpObservable.add(() => {
      advancedTexture.dispose();
      restartScene();
    });

    advancedTexture.addControl(btn);
  }

  // ---------------------------------------------------
  //  LOAD PLAYER + SET UP MOVEMENT + ANIMATION
  // ---------------------------------------------------
  runScene.player.then((result) => {
    const skeleton: Skeleton = result!.skeletons[0];
    const character: AbstractMesh = result!.meshes[0];

    bakedAnimations(runScene.scene, skeleton);

    // Physics body for player
    const playerAggregate = new PhysicsAggregate(
      character,
      PhysicsShapeType.CAPSULE,
      { mass: 1, restitution: 0.2, friction: 0.7 },
      runScene.scene
    );

    let isGrounded = true;
    const jumpForce = new Vector3(0, 5, 0);

    // ---------------------------------------------------
    //  FALLING OBJECTS
    // ---------------------------------------------------
    for (let i = 0; i < 10; i++) {
      const box = MeshBuilder.CreateBox("fallBox_" + i, { size: 1 }, runScene.scene);
      box.position = new Vector3(Math.random() * 10 - 5, 15 + i * 3, Math.random() * 10 - 5);

      const mat = new StandardMaterial("wood", runScene.scene);
      mat.diffuseTexture = new Texture("./assets/textures/wood.jpg", runScene.scene);
      box.material = mat;

      const boxAgg = new PhysicsAggregate(
        box,
        PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.2 },
        runScene.scene
      );

      // collision check
      runScene.scene.onAfterPhysicsObservable.add(() => {
        if (Vector3.Distance(box.position, character.position) < 1.2) {
          showGameOverOverlay();
        }
      });
    }

    // ---------------------------------------------------
    //  MOVEMENT + ANIMATION LOOP
    // ---------------------------------------------------
    runScene.scene.onBeforeRenderObservable.add(() => {

      // Toggle audio with M
      if (getKeyDown() === 1 && (keyDownMap["m"] || keyDownMap["M"])) {
        keyDownHeld();
        runScene.audio.isPlaying ? runScene.audio.stop() : runScene.audio.play();
      }

      let v = new Vector3(0, playerAggregate.body.getLinearVelocity().y, 0);
      let moving = false;
      let speed = keyDownMap["Shift"] ? 5 : 2;

      if (keyDownMap["w"]) { v.x = -speed; character.rotation.y = 4.71; moving = true; }
      if (keyDownMap["s"]) { v.x = speed; character.rotation.y = 1.57; moving = true; }
      if (keyDownMap["a"]) { v.z = -speed; character.rotation.y = 3.14; moving = true; }
      if (keyDownMap["d"]) { v.z = speed; character.rotation.y = 0; moving = true; }

      // jump
      if (keyDownMap[" "] && isGrounded) {
        playerAggregate.body.applyImpulse(jumpForce, character.getAbsolutePosition());
        isGrounded = false;
      }

      playerAggregate.body.setLinearVelocity(v);

      // animation state
      if (moving && !getAnimating()) {
        speed > 2 ? run() : walk();
        toggleAnimating();
      }
      if (!moving && getAnimating()) {
        idle();
        toggleAnimating();
      }
    });

    runScene.scene.onAfterRenderObservable.add(() => {
      if (Math.abs(playerAggregate.body.getLinearVelocity().y) < 0.01) {
        isGrounded = true;
      }
    });
  });

  // ---------------------------------------------------
  //  RETURN THE NEW "SCENE 4 OBJECT"
  // ---------------------------------------------------
  return {
    scene: runScene.scene,
    camera: runScene.camera,
    player: runScene.player,
    audio: runScene.audio,
  };
}
