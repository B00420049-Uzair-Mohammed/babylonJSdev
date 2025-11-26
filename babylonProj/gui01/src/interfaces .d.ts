import {
  Scene,
  Mesh,
  HemisphericLight,
  Camera,
  GroundMesh,
} from "@babylonjs/core";

import {Button }  from "@babylonjs/gui/2D";

export interface SceneData {
  scene: Scene;
  ground:GroundMesh;
  sky: Mesh;
  lightHemispheric: HemisphericLight;
  camera: Camera;
}

export interface GUIData {
  button1:Button;
}
