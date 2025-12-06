import { Scene } from "@babylonjs/core/scene";
import { AnimationPropertiesOverride, AnimationRange, Nullable, Skeleton } from "@babylonjs/core";

var animating:Boolean = false;
var walkRange:Nullable<AnimationRange>;
var runRange:Nullable<AnimationRange>;
var leftRange:Nullable<AnimationRange>;
var rightRange:Nullable<AnimationRange>;
var idleRange:Nullable<AnimationRange>;
var animScene:Scene;
var animSkeleton:Skeleton;




export function bakedAnimations(myscene: Scene, skeleton: Skeleton){
  
   // use baked in animations
   animScene = myscene;
   animSkeleton = skeleton;
   skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
   skeleton.animationPropertiesOverride.enableBlending = true;
   skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
   skeleton.animationPropertiesOverride.loopMode = 1;

   walkRange = skeleton.getAnimationRange("YBot_Walk");
   runRange = skeleton.getAnimationRange("YBot_Run");
   leftRange = skeleton.getAnimationRange("YBot_LeftStrafeWalk");
   rightRange = skeleton.getAnimationRange("YBot_RightStrafeWalk");
   idleRange = skeleton.getAnimationRange("YBot_Idle");
   console.log(idleRange);
   
}

export function walk(){
  animScene.beginAnimation(animSkeleton, walkRange!.from, walkRange!.to, true);
}

export function run(){
  animScene.beginAnimation(animSkeleton, runRange!.from, runRange!.to, true);
}

export function left(){
  animScene.beginAnimation(animSkeleton, leftRange!.from, leftRange!.to, true);
}

export function right(){
  animScene.beginAnimation(animSkeleton, rightRange!.from, rightRange!.to, true);
}

export function idle(){
  animScene.beginAnimation(animSkeleton, idleRange!.from, idleRange!.to, true);
}

export function stopAnimation(){
  animScene.stopAnimation(animSkeleton);
}

export function getAnimating():Boolean{return animating};

export function toggleAnimating(){animating = !animating};

export function info(){
  console.log(idleRange!.from, idleRange!.to);
}
