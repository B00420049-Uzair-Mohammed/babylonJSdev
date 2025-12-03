import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Texture,
  BackgroundMaterial,
  Sound,
} from "@babylonjs/core";

import {
  AdvancedDynamicTexture,
  Button,
  Control,
  StackPanel,
  TextBlock,
} from "@babylonjs/gui";

export default function createMainMenuScene(engine: Engine, setSceneIndex: (i: number) => void) {
  const scene = new Scene(engine);

  // 🌄 Background plane
  const backgroundPlane = MeshBuilder.CreatePlane("backgroundPlane", { width: 16, height: 9 }, scene);
  backgroundPlane.position.z = 5;

  const backgroundMaterial = new BackgroundMaterial("backgroundMaterial", scene);
  backgroundMaterial.diffuseTexture = new Texture("assets/skybox_nx.jpg", scene);
  backgroundMaterial.opacityFresnel = false;
  backgroundPlane.material = backgroundMaterial;

  // ☀️ Light
  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // 🎵 Load audio
  const music = new Sound("arcadeMusic", "assets/audio/arcade-kid.mp3", scene, null, {
    loop: true,
    autoplay: false,
  });

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

    button.onPointerEnterObservable.add(() => {
      button.background = "#2ecc71";
    });
    button.onPointerOutObservable.add(() => {
      button.background = "transparent";
    });

    button.onPointerUpObservable.add(onClick);
    return button;
  }

  // 🎮 Scene navigation buttons
  panel.addControl(createMenuButton("Go to Scene 1", () => setSceneIndex(0)));
  panel.addControl(createMenuButton("Go to Scene 2", () => setSceneIndex(1)));
  panel.addControl(createMenuButton("Go to Scene 3", () => setSceneIndex(2)));
  panel.addControl(createMenuButton("Go to Scene 4", () => setSceneIndex(3)));

  // 🔙 Back to Menu button
  panel.addControl(createMenuButton("Back to Menu", () => setSceneIndex(-1)));

  // 🔊 Audio Toggle Button
  let audioEnabled = false;
  const audioButton = createMenuButton("Enable Audio", () => {
    if (audioEnabled) {
      music.pause();
      audioButton.textBlock!.text = "Enable Audio";
      audioButton.background = "transparent";
      audioEnabled = false;
    } else {
      music.play();
      audioButton.textBlock!.text = "Disable Audio";
      audioButton.background = "#e74c3c";
      audioEnabled = true;
    }
  });
  panel.addControl(audioButton);

  return scene;
}