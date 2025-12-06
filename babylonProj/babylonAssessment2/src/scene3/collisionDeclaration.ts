import { SceneData } from "./interfaces";
import HavokPhysics, { HavokPhysicsWithBindings } from "@babylonjs/havok";
import { AbstractMesh, HavokPlugin, ISceneLoaderAsyncResult, PhysicsAggregate, PhysicsShapeType, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders";

// https://doc.babylonjs.com/typedoc/classes/BABYLON.HavokPlugin
let initializedHavok: any;

HavokPhysics().then((havok) => {
  initializedHavok = havok;
});

const havokInstance: HavokPhysicsWithBindings = await HavokPhysics();
const hk: HavokPlugin = new HavokPlugin(true, havokInstance);


export function collisionDeclaration(runScene : SceneData){

    var collideCB = function (collision: {
        // log collisions
        collider: { transformNode: { name: any } };
        point: any;
        distance: any;
        impulse: any;
        normal: any;
      }) {
        console.log(
          "collideCB",
          collision.collider.transformNode.name,
          collision.point,
          collision.distance,
          collision.impulse,
          collision.normal
        );
      };
      hk.onCollisionObservable.add(collideCB);
    
      runScene.scene.enablePhysics(new Vector3(0, -9.8, 0), hk);
    
    // let playerAggregate: PhysicsAggregate;
      
    //collisions
    
      const groundAggregate = new PhysicsAggregate(
        runScene.ground,
        PhysicsShapeType.BOX,
        { mass: 0, restitution: 0.2, friction: 0.7 },
        runScene.scene
      );
      groundAggregate.body.setCollisionCallbackEnabled(true);
    
      const boxAggregate = new PhysicsAggregate(
        runScene.box1,
        PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.3, friction: 0.7 },
        runScene.scene
      );
      boxAggregate.body.setCollisionCallbackEnabled(true);
    
      const boxAggregate2 = new PhysicsAggregate(
        runScene.box2,
        PhysicsShapeType.BOX,
        { mass: 0.5, restitution: 0.3, friction: 0.7 },
        runScene.scene
      );
      boxAggregate2.body.setCollisionCallbackEnabled(true);
    
      runScene.player!.then((result: void | ISceneLoaderAsyncResult) => {
        let character: AbstractMesh = result!.meshes[0];
        character.rotation = new Vector3(0, 0.5, 0);
    
        const playerAggregate = new PhysicsAggregate(
          character,
          PhysicsShapeType.CAPSULE,
          { mass: 0.1, restitution: 1, friction: 1 },
          runScene.scene
        );
        playerAggregate.body.setMassProperties({
          inertia: new Vector3(0, 0.0, 0.0), 
        });
        playerAggregate.body.setAngularVelocity(new Vector3(0, 12, 0));
        
        playerAggregate.body.applyImpulse (new Vector3(0, 0, 0),character.position);

        playerAggregate.body.disablePreStep = false;
        playerAggregate.body.setCollisionCallbackEnabled(true);
        
      });
}
