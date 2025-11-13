import {
  Scene,
  Mesh,
  HemisphericLight,
  Camera,
} from "@babylonjs/core";

export interface SceneData {
  scene: Scene,
  ground: Mesh,
  sphere: Mesh,
  box: Mesh,
  cylinder: Mesh,
  cone: Mesh,
  triangle: Mesh,
  capsule: Mesh,
  torus: Mesh,
  plane: Mesh,
  tube: Mesh,
  extrusion: Mesh,
  octahedron: Mesh,
  plane2: Mesh,
  lightHemispheric: HemisphericLight,
  camera: Camera
}
