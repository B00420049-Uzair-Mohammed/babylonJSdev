import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Texture,
  BackgroundMaterial,
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  Button,
  Control,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";

export default function createMainMenuScene(engine: Engine) {
  const scene = new Scene(engine);

  // 🌄 Background plane using skybox_nx.jpg
  const backgroundPlane = MeshBuilder.CreatePlane("backgroundPlane", { width: 16, height: 9 }, scene);
  backgroundPlane.position.z = 5;

  const backgroundMaterial = new BackgroundMaterial("backgroundMaterial", scene);
  backgroundMaterial.diffuseTexture = new Texture("assets/skybox_nx.jpg", scene); // <-- Your image path
  backgroundMaterial.opacityFresnel = false;
  backgroundPlane.material = backgroundMaterial;

  // ☀️ Light
  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // 🖥️ GUI setup
  const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  const title = new TextBlock();
  title.text = "Welcome to the Game!";
  title.fontSize = 36;
  title.color = "white";
  title.top = "-200px";
  title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  guiTexture.addControl(title);

  const panel = new StackPanel();
  panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  panel.spacing = 20;
  guiTexture.addControl(panel);

  function createMenuButton(label: string, onClick: () => void) {
    const button = Button.CreateSimpleButton(label.toLowerCase(), label);
    button.width = "200px";
    button.height = "60px";
    button.cornerRadius = 20;
    button.color = "white";
    button.background = "transparent";
    button.fontSize = "24px";
    button.thickness = 2;

    // Hover effect
    button.onPointerEnterObservable.add(() => {
      button.background = "#2ecc71";
    });
    button.onPointerOutObservable.add(() => {
      button.background = "transparent";
    });

    button.onPointerUpObservable.add(onClick);
    return button;
  }

  const startButton = createMenuButton("Start Game", () => {
    console.log("Start Game clicked");
  });

  const optionsButton = createMenuButton("Options", () => {
    console.log("Options clicked");
  });

  panel.addControl(startButton);
  panel.addControl(optionsButton);

  return scene;
}

