import Phaser from "phaser";

export default class StageSelectScene extends Phaser.Scene {
  constructor() {
    super("StageSelectScene");
  }

  init(data) {
    // ✅ Receive selected character from ArcadeModeScene
    this.selectedCharacter = data.selectedCharacter || "Unknown";

    // 🧠 Save chosen character globally so it can be accessed later (optional)
    this.registry.set("selectedCharacter", this.selectedCharacter);
  }

  preload() {
    // 🖼️ Load all stage images (originals are 1920×1080, auto-scaled)
    this.load.image("stage1", "/assets/stages/carbon_market.png");
    this.load.image("stage2", "/assets/stages/lasang.png");
    this.load.image("stage3", "/assets/stages/kapatagan.png");
    this.load.image("stage4", "/assets/stages/takipsilim.png");
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500, 0, 0, 0);

    //
    // 🌌 Background
    //
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

    //
    // 🧍 Display Selected Character
    //
    this.add.text(width / 2, 60, `PLAYER: ${this.selectedCharacter}`, {
      fontSize: "32px",
      fill: "#00ffcc",
      fontFamily: "Impact",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    //
    // 🗺️ Stage Thumbnails
    //
    const stages = [
      { name: "Kabukiran", key: "stage1" },
      { name: "Lasang", key: "stage2" },
      { name: "Kapatagan", key: "stage3" },
      { name: "Takipsilim", key: "stage4" },
    ];

    const cols = 4;
    const spacingX = 200;
    const spacingY = 180;
    const startX = width / 2 - ((cols - 1) * spacingX) / 2;
    const startY = height / 2 - 80;

    stages.forEach((stage, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const frame = this.add.rectangle(x, y, 150, 100, 0x111111, 0.8)
        .setStrokeStyle(2, 0xffffff, 0.4)
        .setInteractive({ useHandCursor: true });

      const img = this.add.image(x, y, stage.key);
      img.setDisplaySize(150, 100);

      const label = this.add.text(x, y + 75, stage.name, {
        fontSize: "18px",
        fill: "#ffffff",
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0.5);

      // ✨ Hover animation (no shrinking)
      frame.on("pointerover", () => {
        frame.setStrokeStyle(3, 0x00ffff, 0.9);
        frame.setFillStyle(0x00ffff, 0.15);
        label.setColor("#00ffff");
      });

      frame.on("pointerout", () => {
        frame.setStrokeStyle(2, 0xffffff, 0.4);
        frame.setFillStyle(0x111111, 0.8);
        label.setColor("#ffffff");
      });

      // ✅ Stage selection and transition to LoadingScene
      frame.on("pointerdown", () => {
        this.tweens.add({
          targets: frame,
          alpha: { from: 1, to: 0.4 },
          duration: 100,
          yoyo: true,
          repeat: 1,
        });

        this.time.delayedCall(400, () => {
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.cameras.main.once("camerafadeoutcomplete", () => {
            // Save stage name in registry (optional)
            this.registry.set("selectedStage", stage.name);

            // Transition to LoadingScene
            this.scene.start("FinalizationScene", {
              selectedCharacter: this.selectedCharacter,
              selectedStage: stage.name,
            });
          });
        });
      });
    });

    //
    // 🔙 Back button
    //
    const backText = this.add.text(width / 2, height - 40, "← BACK", {
      fontSize: "26px",
      fill: "#ff4444",
      fontFamily: "Arial Black",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backText.on("pointerover", () => {
      this.tweens.add({ targets: backText, scale: 1.1, duration: 120 });
    });
    backText.on("pointerout", () => {
      this.tweens.add({ targets: backText, scale: 1, duration: 120 });
    });
    backText.on("pointerdown", () => {
      this.scene.start("ArcadeModeScene");
    });
  }
}
