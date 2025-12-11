// scene4/bakedAnimations.ts

import { Scene } from "@babylonjs/core/scene";
import { AnimationPropertiesOverride, AnimationRange, Nullable, Skeleton } from "@babylonjs/core";

let animating: boolean = false;
let walkRange: Nullable<AnimationRange> = null;
let runRange: Nullable<AnimationRange> = null;
let leftRange: Nullable<AnimationRange> = null;
let rightRange: Nullable<AnimationRange> = null;
let idleRange: Nullable<AnimationRange> = null;
let animScene: Nullable<Scene> = null;
let animSkeleton: Nullable<Skeleton> = null;

/**
 * Initialize baked animations for a skeleton in a scene.
 */
export function bakedAnimations(myscene: Scene, skeleton: Skeleton) {
  if (!myscene || !skeleton) {
    console.warn("[Scene4/bakedAnimations] Scene or skeleton missing!");
    return;
  }

  animScene = myscene;
  animSkeleton = skeleton;

  skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
  skeleton.animationPropertiesOverride.enableBlending = true;
  skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
  skeleton.animationPropertiesOverride.loopMode = 1;

  walkRange = skeleton.getAnimationRange("YBot_Walk") || null;
  runRange = skeleton.getAnimationRange("YBot_Run") || null;
  leftRange = skeleton.getAnimationRange("YBot_LeftStrafeWalk") || null;
  rightRange = skeleton.getAnimationRange("YBot_RightStrafeWalk") || null;
  idleRange = skeleton.getAnimationRange("YBot_Idle") || null;

  console.log("[Scene4/bakedAnimations] Animation ranges initialized", {
    walkRange,
    runRange,
    leftRange,
    rightRange,
    idleRange,
  });
}

/** Helper function to play animation safely */
function playAnimation(range: Nullable<AnimationRange>, loop: boolean = true) {
  if (!animScene || !animSkeleton) {
    console.warn("[Scene4/bakedAnimations] Scene or skeleton not initialized");
    return;
  }
  if (!range) {
    console.warn("[Scene4/bakedAnimations] Animation range not found, cannot play");
    return;
  }
  animScene.beginAnimation(animSkeleton, range.from, range.to, loop);
}

// Animation functions
export function walk() { playAnimation(walkRange); }
export function run() { playAnimation(runRange); }
export function left() { playAnimation(leftRange); }
export function right() { playAnimation(rightRange); }
export function idle() { playAnimation(idleRange); }

/** Stop all animations */
export function stopAnimation() {
  if (animScene && animSkeleton) {
    animScene.stopAnimation(animSkeleton);
  }
}

// Animation state
export function getAnimating(): boolean { return animating; }
export function toggleAnimating() { animating = !animating; }

// Debug info
export function info() {
  if (!idleRange) {
    console.log("[Scene4/bakedAnimations] idleRange not set");
    return;
  }
  console.log("[Scene4/bakedAnimations] idleRange from/to:", idleRange.from, idleRange.to);
}
