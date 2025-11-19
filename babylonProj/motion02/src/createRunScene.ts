import { AbstractMesh, ActionManager, CubeTexture, Mesh, _ENVTextureLoader } from "@babylonjs/core";
import { SceneData } from "./interfaces ";
import {
  keyActionManager,
  keyDownMap,
  keyDownHeld,
  getKeyDown,
} from "./keyActionManager";
import { characterActionManager } from "./characterActionManager" ;

import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/core/Helpers/sceneHelpers";
export default function createRunScene(runScene: SceneData) {
  runScene.scene.actionManager = new ActionManager(runScene.scene);
  keyActionManager(runScene.scene);

  const environmentTexture = new CubeTexture(
    "assets/textures/industrialSky.env",
    runScene.scene
  );
  const skybox = runScene.scene.createDefaultSkybox(
    environmentTexture,
    true,
    10000,
    0.1
  );
  runScene.audio.stop();
  runScene.scene.onBeforeRenderObservable.add(() => {
    // check and respond to keypad presses

    if (getKeyDown() == 1 && (keyDownMap["m"] || keyDownMap["M"])) {
      keyDownHeld();
      if (runScene.audio.isPlaying) {
        runScene.audio.stop();
      } else {
        runScene.audio.play();
      }
    }

    runScene.player.then((result) => {
      let character: AbstractMesh = result!.meshes[0];
      if (keyDownMap["w"] || keyDownMap["ArrowUp"]) {
        character.position.x -= 0.1;
        character.rotation.y = (3 * Math.PI) / 2;
      }
      if (keyDownMap["a"] || keyDownMap["ArrowLeft"]) {
        character.position.z -= 0.1;
        character.rotation.y = (2 * Math.PI) / 2;
      }
      if (keyDownMap["s"] || keyDownMap["ArrowDown"]) {
        character.position.x += 0.1;
        character.rotation.y = (1 * Math.PI) / 2;
      }
      if (keyDownMap["d"] || keyDownMap["ArrowRight"]) {
        character.position.z += 0.1;
        character.rotation.y = (0 * Math.PI) / 2;
      }
    });
  });

// add incremental action to player
  runScene.player.then((result) => {  
    let characterMesh = result!.meshes[0];
    characterActionManager(runScene.scene, characterMesh as Mesh);
  });

  runScene.scene.onAfterRenderObservable.add(() => {});
  
}
