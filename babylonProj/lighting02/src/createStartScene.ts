// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
import { Scene, ArcRotateCamera, Vector3,
         MeshBuilder, Mesh,
         StandardMaterial,
         HemisphericLight, PointLight, SpotLight, DirectionalLight, Color3,
         Camera,
         ShadowGenerator,
         Engine} from "@babylonjs/core";

function createBox(scene: Scene ){
    let box = MeshBuilder.CreateBox("box",{size: 1}, scene);
    box.position.y = 3;
    box.position.y = 0.51;
    return box;
}
    
function createPointLight(scene: Scene ){
    const light = new PointLight("light", new Vector3(-1, 1, 0),scene);
    light.position = new Vector3(5, 20, 10);
    light.intensity = 0.3;
    light.diffuse = new Color3(0.5, 1, 1);
    light.specular = new Color3(0.8, 1, 1);
    return light;
}

function createDirectionalLight(scene: Scene ){
    const light = new DirectionalLight("light", new Vector3(0.2, -1, 0.2),scene);
    light.position = new Vector3(20, 40, 20);
    light.intensity = 0.7;
    light.diffuse = new Color3(1, 0, 0);
    light.specular = new Color3(0, 1, 0);
    return light;
}

function createSpotLight(scene: Scene ){
    const light = new SpotLight("light", new Vector3(1, 5, -3), 
        new Vector3(0, -1, 0), Math.PI / 3, 20, scene);
    light.intensity = 0.5;
    light.diffuse = new Color3(1, 0, 0);
    light.specular = new Color3(0, 1, 0);
    return light;
}
   
function createHemisphericLight(scene: Scene ){
    const light:HemisphericLight = new HemisphericLight("light", new Vector3(1, 10, 0),scene);
    light.intensity = 0.3;
    light.diffuse = new Color3(1, 0, 0);
    light.specular = new Color3(0, 1, 0);
    light.groundColor = new Color3(0, 1, 0);
    return light;
}

function createShadows(light: DirectionalLight, sphere: Mesh ,box: Mesh){
    const shadower = new ShadowGenerator(1024, light);
    const sm : any = shadower.getShadowMap();
    sm.renderList.push(sphere, box);

    shadower.setDarkness(0.2);
    shadower.useBlurExponentialShadowMap = true;
    shadower.blurScale = 4;
    shadower.blurBoxOffset = 1;
    shadower.useKernelBlur = true;
    shadower.blurKernel = 64;
    shadower.bias = 0;
    return shadower;
}

function createSphere(scene: Scene){
    let sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);
    sphere.position.y = 1.5;
    return sphere;
}
   
function createGround(scene: Scene){
    let ground = MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
    var groundMaterial = new StandardMaterial("groundMaterial", scene);
    groundMaterial.backFaceCulling = false;
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    return ground;
}

function createArcRotateCamera(scene: Scene){
    let camAlpha = -Math.PI / 2,
    camBeta  =  Math.PI / 2.5,
    camDist  =  10,
    camTarget = new Vector3(0, 0, 0); 
    let camera = new ArcRotateCamera("camera1", camAlpha, camBeta, camDist, camTarget, scene);
    camera.attachControl(true);
    return camera;
}

export default function createStartScene(engine:Engine) {
    interface SceneData {
        scene:Scene,
        box?: Mesh,
        lightBulb?: PointLight,
        lightDirectional?: DirectionalLight,
        lightSpot?: SpotLight,
        lightHemispheric?: HemisphericLight,
        sphere?: Mesh,
        ground?: Mesh,
        camera?:Camera,
        shadowGenerator?: ShadowGenerator
    };

    let that:SceneData = {scene:new Scene(engine)};
    // that.scene.debugLayer.show();

    that.box = createBox(that.scene);
    that.lightBulb = createPointLight(that.scene);
    that.lightDirectional = createDirectionalLight(that.scene);
    that.lightSpot = createSpotLight(that.scene);
    that.lightHemispheric = createHemisphericLight(that.scene);
    that.sphere = createSphere(that.scene);
    that.ground = createGround(that.scene);
    that.camera = createArcRotateCamera(that.scene);
    that.shadowGenerator = createShadows(that.lightDirectional,that.sphere,that.box)
    return that;
}
