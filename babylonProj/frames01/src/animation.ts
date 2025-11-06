import { Animation, Color3, Vector3 } from "@babylonjs/core";

interface PositionArray {
    frame: number;
    value: number;
}

interface ScaleArray {
    frame: number;
    value: Vector3;
}

interface colorArray {
    frame: number;
    value: Color3;
}

export const frameRate = 30;

export function createxSlide(frameRate: number){
    const xSlide = new Animation(
        "xSlide",
        "position.x",
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const keyFramesX: PositionArray[] = [];
    keyFramesX.push({ frame: 0, value: 2 });
    keyFramesX.push({ frame: frameRate, value: -2 });
    keyFramesX.push({ frame: (2 * frameRate)-1, value: (-2 + (4 * ( frameRate /2) / ((frameRate/2) -1))) });

    xSlide.setKeys(keyFramesX);
    return xSlide
}

