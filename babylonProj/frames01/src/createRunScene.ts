import { SceneData } from "./interfaces ";

import { createxSlide, createySlide, frameRate } from "./animation";


export default function createRunScene(runScene: SceneData) {
  runScene.sphere.position.y = -2;    

  runScene.box.animations.push(createxSlide(frameRate));
  runScene.box.animations.push(createySlide(frameRate));
  runScene.scene.beginAnimation(runScene.box, 0, 2 * frameRate, true);


}                                   
