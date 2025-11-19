import { ExecuteCodeAction } from "@babylonjs/core/Actions";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { Scene } from "@babylonjs/core/scene";

export let keyDownMap: Boolean[] = [];
let keyDown:number = 0;
export function keyDownHeld(){ keyDown = 2}; 
export function getKeyDown():number {return keyDown};

export function keyActionManager(scene: Scene) {
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyDownTrigger,
      },
      function (evt) {
        if (keyDown == 0){keyDown ++}
        keyDownMap[evt.sourceEvent.key] = true;
      }
    )
  );
  scene.actionManager.registerAction(
    new ExecuteCodeAction(
      {
        trigger: ActionManager.OnKeyUpTrigger,
      },
      function (evt) {
        keyDown = 0;
        keyDownMap[evt.sourceEvent.key] = false;
      }
    )
  );
  return scene.actionManager;
}
