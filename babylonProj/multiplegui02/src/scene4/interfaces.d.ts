import {
  Scene,
  Mesh,
  HemisphericLight,
  Camera,
  Sound,
  ISceneLoaderAsyncResult,
} from "@babylonjs/core";

export interface SceneData {
  scene: Scene;
  ground: Mesh;
  terrain: Mesh;
  sky: Mesh;
  lightHemispheric: HemisphericLight;
  camera: Camera;
  player: Promise<ISceneLoaderAsyncResult>;
  audio: Sound;
}