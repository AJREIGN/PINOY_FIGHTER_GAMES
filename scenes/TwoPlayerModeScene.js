import Phaser from "phaser";

export default class TwoPlayerModeScene extends Phaser.Scene {
  constructor() {
    super("TwoPlayerModeScene");
  }

  preload() {
    this.load.image("bg", "/assets/images/bg.png");
    this.load.image("frame", "/assets/images/frame.png");

    this.load.spritesheet("hunter", "/assets/characters/hunter/idle.png", { frameWidth: 180, frameHeight: 180 });
    this.load.spritesheet("LapuLapu", "/assets/characters/LapuLapu/idle.png", { frameWidth: 180, frameHeight: 180 });
    this.load.spritesheet("panday", "/assets/characters/panday/idle.png", { frameWidth: 180, frameHeight: 180 });
    this.load.spritesheet("magellan", "/assets/characters/magellan/idle.png", { frameWidth: 180, frameHeight: 180 });
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(600, 0, 0, 0);

    const bg = this.add.image(width / 2, height / 2, "bg");
    bg.setDisplaySize(width, height).setAlpha(0.9);

    this.add.text(width / 2, 60, "2-PLAYER MODE: SELECT FIGHTERS", {
      fontSize: "40px",
      fill: "#00ffee",
      fontFamily: "Impact",
      stroke: "#000000",
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: "#003333", blur: 10, fill: true },
    }).setOrigin(0.5);

    const characters = [
      { name: "Hunter", key: "hunter" },
      { name: "LapuLapu", key: "LapuLapu" },
      { name: "Panday", key: "panday" },
      { name: "Magellan", key: "magellan" },
    ];

    characters.forEach((char) => {
      this.anims.create({
        key: char.key + "_idle",
        frames: this.anims.generateFrameNumbers(char.key, { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1,
      });
    });

    const cols = 4;
    const spacingX = 220;
    const startX = width / 2 - ((cols - 1) * spacingX) / 2;
    const y = height / 2;

    this.player1Selection = null;
    this.player2Selection = null;

    characters.forEach((char, i) => {
      const x = startX + i * spacingX;

      const frame = this.add.image(x, y, "frame").setScale(0.6).setAlpha(0.9);
      const portrait = this.add.sprite(x, y, char.key).setScale(2).play(char.key + "_idle");
      portrait.setInteractive({ useHandCursor: true });

      const label = this.add.text(x, y + 100, char.name, {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 3,
      }).setOrigin(0.5);

      portrait.on("pointerover", () => {
        frame.setTint(0x00ffff);
        label.setColor("#00ffff");
      });

      portrait.on("pointerout", () => {
        frame.clearTint();
        label.setColor("#ffffff");
      });

      portrait.on("pointerdown", () => {
    if (!this.player1Selection) {
        this.player1Selection = char.key; // <-- use key here
        frame.setTint(0x00ff00);
        label.setText(char.name + "\n(P1)");
    } else if (!this.player2Selection && char.key !== this.player1Selection) {
        this.player2Selection = char.key; // <-- use key here
        frame.setTint(0xff0000);
        label.setText(char.name + "\n(P2)");
        this.startStageSelect();
    }
});
    });

    const backText = this.add.text(width / 2, height - 50, "← BACK", {
      fontSize: "28px",
      fill: "#ff5555",
      fontFamily: "Arial Black",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backText.on("pointerdown", () => {
      this.scene.start("SinglePlayerMenuScene");
    });
  }

  startStageSelect() {
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("StageSelectScene_2P", {
        player1Character: this.player1Selection,
        player2Character: this.player2Selection,
      });
    });
  }
}

