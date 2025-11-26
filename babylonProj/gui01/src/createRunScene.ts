import {} from "@babylonjs/core";

import { SceneData } from "./interfaces ";
import "@babylonjs/loaders";

export default function createRunScene(runScene: SceneData) {
  runScene.scene.onAfterRenderObservable.add(() => {});
}
