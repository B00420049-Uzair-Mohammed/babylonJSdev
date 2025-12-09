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
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

import { keyActionManager, keyDownMap, keyDownHeld, getKeyDown } from "./keyActionManager";
import { bakedAnimations, walk, run, idle, getAnimating, toggleAnimating } from "./bakedAnimations";
import HavokPhysics from "@babylonjs/havok";

export default async function createRunScene(runScene: SceneData, restartScene: () => void) {
  // Initialize Havok physics
  const havokInstance = await HavokPhysics();
  const hk = new HavokPlugin(true, havokInstance);
  runScene.scene.enablePhysics(new Vector3(0, -9.8, 0), hk);

  // Attach input manager
  keyActionManager(runScene.scene);

  // GUI for restart + game over
  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  function showGameOverOverlay() {
    // Game Over text
    const textBlock = new GUI.TextBlock();
    textBlock.text = "GAME OVER";
    textBlock.color = "white";
    textBlock.fontSize = 48;
    textBlock.top = "-100px";
    advancedTexture.addControl(textBlock);

    // Restart button
    const button = GUI.Button.CreateSimpleButton("restartBtn", "Restart");
    button.width = "200px";
    button.height = "60px";
    button.color = "white";
    button.background = "red";
    button.onPointerUpObservable.add(() => {
      runScene.scene.dispose();
      advancedTexture.dispose();
      restartScene();
    });
    advancedTexture.addControl(button);
  }

  // Add baked animations once player is loaded
  runScene.player.then((result) => {
    const skeleton: Skeleton = result!.skeletons[0];
    bakedAnimations(runScene.scene, skeleton);

    const character: AbstractMesh = result!.meshes[0];

    // Attach physics aggregate to player
    const playerAggregate = new PhysicsAggregate(
      character,
      PhysicsShapeType.CAPSULE,
      { mass: 1, restitution: 0.2, friction: 0.7 },
      runScene.scene
    );

    let isGrounded = true;
    const jumpForce = new Vector3(0, 5, 0);

    // Spawn falling boxes
    for (let i = 0; i < 10; i++) {
      const box = MeshBuilder.CreateBox("fallingBox" + i, { size: 1 }, runScene.scene);
      box.position = new Vector3(Math.random() * 10 - 5, 15 + i * 5, Math.random() * 10 - 5);

      const mat = new StandardMaterial("woodMat", runScene.scene);
      mat.diffuseTexture = new Texture("./assets/textures/wood.jpg", runScene.scene);
      box.material = mat;

      const boxAggregate = new PhysicsAggregate(
        box,
        PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.1, friction: 0.7 },
        runScene.scene
      );

      // Collision detection with player
      boxAggregate.body.setCollisionCallbackEnabled(true);
      playerAggregate.body.setCollisionCallbackEnabled(true);

      runScene.scene.onAfterPhysicsObservable.add(() => {
        const distance = Vector3.Distance(box.position, character.position);
        if (distance < 1.2) {
          showGameOverOverlay();
        }
      });
    }

    runScene.scene.onBeforeRenderObservable.add(() => {
      // Toggle audio with M key
      if (getKeyDown() === 1 && (keyDownMap["m"] || keyDownMap["M"])) {
        keyDownHeld();
        runScene.audio.isPlaying ? runScene.audio.stop() : runScene.audio.play();
      }

      // Movement via physics
      let velocity = new Vector3(0, playerAggregate.body.getLinearVelocity().y, 0);
      let characterMoving = false;

      let speed = 2;
      if (keyDownMap["Shift"]) speed = 5; // sprint

      if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
        velocity.x = -speed;
        character.rotation.y = (3 * Math.PI) / 2;
        characterMoving = true;
      }
      if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
        velocity.z = -speed;
        character.rotation.y = Math.PI;
        characterMoving = true;
      }
      if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
        velocity.x = speed;
        character.rotation.y = Math.PI / 2;
        characterMoving = true;
      }
      if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
        velocity.z = speed;
        character.rotation.y = 0;
        characterMoving = true;
      }

      // Jump
      if (keyDownMap[" "] && isGrounded) {
        playerAggregate.body.applyImpulse(jumpForce, character.getAbsolutePosition());
        isGrounded = false;
      }

      playerAggregate.body.setLinearVelocity(velocity);

      // Animation state
      if (getKeyDown() && characterMoving) {
        if (!getAnimating()) {
          speed > 2 ? run() : walk();
          toggleAnimating();
        }
      } else {
        if (getAnimating()) {
          idle();
          toggleAnimating();
        }
      }
    });

    runScene.scene.onAfterRenderObservable.add(() => {
      const vel = playerAggregate.body.getLinearVelocity();
      if (Math.abs(vel.y) < 0.01) {
        isGrounded = true;
      }
    });
  });
}