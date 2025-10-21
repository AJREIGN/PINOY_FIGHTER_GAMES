import Phaser from "phaser";

export default class ArcadeModeScene extends Phaser.Scene {
  constructor() {
    super("ArcadeModeScene");
  }

  preload() {
    // 🌌 Background + UI assets
    this.load.image("bg", "assets/images/bg.png");
    this.load.image("frame", "assets/images/frame.png");


    this.load.spritesheet("hunter", "assets/characters/hunter/idle.png", {
      frameWidth: 180,
      frameHeight: 180,
    });
    this.load.spritesheet("lapulapu", "assets/characters/LapuLapu/idle.png", {
      frameWidth: 180,
      frameHeight: 180,
    });
    this.load.spritesheet("panday", "assets/characters/panday/idle.png", {
      frameWidth: 180,
      frameHeight: 180,
    });
    this.load.spritesheet("magellan", "assets/characters/magellan/idle.png", {
      frameWidth: 180,
      frameHeight: 180,
    });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // 🌌 Background
    const bg = this.add.image(width / 2, height / 2, "bg");
    bg.setDisplaySize(width, height);
    bg.setAlpha(0.9);

    // 🏷️ Title
    this.add.text(width / 2, 80, "CHOOSE YOUR FIGHTER", {
      fontSize: "42px",
      fill: "#00ffee",
      fontFamily: "Impact",
      stroke: "#000000",
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: "#003333", blur: 10, fill: true },
    }).setOrigin(0.5);

    // 🧍 Character List
    const characters = [
      { name: "Hunter", key: "hunter" },
      { name: "Lapu-Lapu", key: "lapulapu" },
      { name: "Panday", key: "panday" },
      { name: "Magellan", key: "magellan" },
    ];

    // 🌀 Create animations for each character
    characters.forEach((char) => {
      this.anims.create({
        key: `${char.key}_idle`,
        frames: this.anims.generateFrameNumbers(char.key, { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1,
      });
    });

    // ⚙️ Layout setup
    const cols = 4;
    const rows = 2;
    const marginX = width * 0.12;
    const marginY = height * 0.25;
    const availableWidth = width - marginX * 2;
    const availableHeight = height - marginY * 1.4;
    const spacingX = availableWidth / (cols - 1);
    const spacingY = availableHeight / (rows - 1);
    const startX = marginX;
    const startY = marginY + 40;
    const frameScale = 0.6;

    characters.forEach((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      // 🎞️ Frame Border
      const frame = this.add.image(x, y, "frame").setScale(frameScale);
      frame.setAlpha(0.9);

      // 🧍 Animated Portrait (from spritesheet)
      const portrait = this.add.sprite(x, y, char.key);
      portrait.setScale(2);
      portrait.play(`${char.key}_idle`);
      portrait.setInteractive({ useHandCursor: true });

      // 🏷️ Name Label
      const label = this.add.text(x, y + 100, char.name, {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 3,
      }).setOrigin(0.5);

      // ✨ Hover highlight
      portrait.on("pointerover", () => {
        frame.setTint(0x00ffff);
        label.setColor("#00ffff");
      });
      portrait.on("pointerout", () => {
        frame.clearTint();
        label.setColor("#ffffff");
      });

      // 🖱️ Select Fighter
      portrait.on("pointerdown", () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("StageSelectScene", { selectedCharacter: char.name });
        });
      });
    });

    // 🔙 Back Button
    const backText = this.add.text(width / 2, height - 50, "← BACK", {
      fontSize: "28px",
      fill: "#ff5555",
      fontFamily: "Arial Black",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backText.on("pointerover", () =>
      this.tweens.add({ targets: backText, scale: 1.1, duration: 100 })
    );
    backText.on("pointerout", () =>
      this.tweens.add({ targets: backText, scale: 1, duration: 100 })
    );
    backText.on("pointerdown", () => {
      this.scene.start("SinglePlayerMenuScene");
    });
  }
}
