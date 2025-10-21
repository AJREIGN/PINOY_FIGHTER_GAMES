import Phaser from "phaser";

export default class StageSelectScene_2P extends Phaser.Scene {
  constructor() {
    super("StageSelectScene_2P");
  }

  init(data) {
    this.player1Character = data.player1Character;
    this.player2Character = data.player2Character;
  }

  preload() {
    this.load.image("stage1", "/assets/stages/carbon_market.png");
    this.load.image("stage2", "/assets/stages/lasang.png");
    this.load.image("stage3", "/assets/stages/kapatagan.png");
    this.load.image("stage4", "/assets/stages/takipsilim.png");
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500, 0, 0, 0);

    if (this.textures.exists("bg")) {
      const bg = this.add.image(width / 2, height / 2, "bg");
      bg.setDisplaySize(width, height);
      bg.setAlpha(0.85);
      this.tweens.add({
        targets: bg,
        scale: { from: 1, to: 1.02 },
        duration: 4000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      this.cameras.main.setBackgroundColor("#101010");
    }

    // Player info text (no backticks)
    this.add.text(width / 2, 60, "P1: " + this.player1Character + "  |  P2: " + this.player2Character, {
      fontSize: "30px",
      fill: "#00ffcc",
      fontFamily: "Impact",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    const stages = [
      { name: "Kabukiran", key: "stage1" },
      { name: "Lasang", key: "stage2" },
      { name: "Kapatagan", key: "stage3" },
      { name: "Takipsilim", key: "stage4" },
    ];

    const cols = 4;
    const spacingX = 200;
    const startX = width / 2 - ((cols - 1) * spacingX) / 2;
    const y = height / 2;

    stages.forEach((stage, i) => {
      const x = startX + i * spacingX;

      const frame = this.add.rectangle(x, y, 150, 100, 0x111111, 0.8)
        .setStrokeStyle(2, 0xffffff, 0.4)
        .setInteractive({ useHandCursor: true });

      const img = this.add.image(x, y, stage.key).setDisplaySize(150, 100);

      const label = this.add.text(x, y + 75, stage.name, {
        fontSize: "18px",
        fill: "#ffffff",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0.5);

      frame.on("pointerover", function() {
        frame.setStrokeStyle(3, 0x00ffff, 0.9);
        frame.setFillStyle(0x00ffff, 0.15);
        label.setColor("#00ffff");
      });

      frame.on("pointerout", function() {
        frame.setStrokeStyle(2, 0xffffff, 0.4);
        frame.setFillStyle(0x111111, 0.8);
        label.setColor("#ffffff");
      });

      frame.on("pointerdown", () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("Finalization2PScene", {
            player1Character: this.player1Character,
            player2Character: this.player2Character,
            selectedStage: stage.name
          });
        });
      });
    });
  }
}
