import {
  Scene,
  Sound,
  Mesh,
  HemisphericLight,
  Camera,
  ISceneLoaderAsyncResult,
} from "@babylonjs/core";

export interface SceneData {
  scene: Scene;
  audio: Sound;
  lightHemispheric: HemisphericLight;
  camera: Camera;
  box1: Mesh;
  box2: Mesh;
  player: Promise<void | ISceneLoaderAsyncResult>;
  ground: Mesh;
}
