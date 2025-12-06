import {
  IncrementValueAction,
  PredicateCondition,
  SetValueAction,
} from "@babylonjs/core/Actions";
import { ActionManager } from "@babylonjs/core/Actions/actionManager";
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core";

export function characterActionManager(scene: Scene, character: Mesh) {
  character.actionManager = new ActionManager(scene);
  let pickItem = { flag: false };

  scene.actionManager.registerAction(
    new IncrementValueAction(
      ActionManager.OnEveryFrameTrigger,
      character,
      "rotation.y",
      0.1,
      new PredicateCondition(
        character.actionManager as ActionManager,
        function () {
          return pickItem.flag == true;
        }
      )
    )
  );

  character.actionManager.registerAction(
    new SetValueAction(ActionManager.OnPickDownTrigger, pickItem, "flag", true)
  );

  character.actionManager.registerAction(
    new SetValueAction(
      ActionManager.OnLongPressTrigger,
      pickItem,
      "flag",
      false
    )
  );
}
