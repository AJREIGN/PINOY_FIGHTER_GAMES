import Phaser from "phaser";

export default class SinglePlayerMenuScene extends Phaser.Scene {
  constructor() {
    super("SinglePlayerMenuScene");
  }

  create() {
    const { width, height } = this.cameras.main;

    //
    // 🌌 Smooth background
    //
    let bg;
    if (this.textures.exists("bg")) {
      bg = this.add.image(width / 2, height / 2, "bg");
      bg.setDisplaySize(width, height);
      bg.setAlpha(0.85);
      bg.setDepth(-2);

      // Subtle zoom animation
      this.tweens.add({
        targets: bg,
        scale: { from: 1, to: 1.02 },
        duration: 5000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      this.cameras.main.setBackgroundColor("#101010");
    }

    //
    // 🏷️ Title
    //
    const title = this.add
      .text(width / 2, 110, "SINGLE PLAYER", {
        fontSize: "44px",
        fill: "#00ffcc",
        fontFamily: "Impact",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 800,
      ease: "Sine.easeOut",
    });

    //
    // 🎨 Button Creator (clean + glow)
    //
    const createButton = (y, label, color, callback) => {
      const boxWidth = 320,
        boxHeight = 75;
      const container = this.add.container(width / 2, y);

      const box = this.add.graphics();
      box.fillStyle(0x111111, 0.85);
      box.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 18);
      box.lineStyle(2, 0xffffff, 0.1);
      box.strokeRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 18);

      const text = this.add.text(0, 0, label, {
        fontSize: "28px",
        fill: color,
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 5,
      }).setOrigin(0.5);

      text.setShadow(0, 0, color, 10, true, true);

      container.add([box, text]);
      container.setSize(boxWidth, boxHeight);
      container.setInteractive({ useHandCursor: true });

      // Hover animations
      container.on("pointerover", () => {
        this.tweens.add({
          targets: container,
          scale: 1.08,
          duration: 150,
          ease: "Back.Out",
        });
        text.setFill("#00ffff");
        text.setShadow(0, 0, "#00ffff", 15, true, true);
      });

      container.on("pointerout", () => {
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 120,
          ease: "Sine.easeInOut",
        });
        text.setFill(color);
        text.setShadow(0, 0, color, 10, true, true);
      });

      // Click animation
      container.on("pointerdown", () => {
        this.tweens.add({
          targets: container,
          scale: 0.92,
          duration: 100,
          yoyo: true,
          ease: "Sine.easeOut",
          onComplete: callback,
        });
      });

      // Fade-in effect
      container.setAlpha(0);
      this.tweens.add({
        targets: container,
        alpha: 1,
        duration: 600,
        delay: (y / height) * 400,
        ease: "Sine.easeOut",
      });

      return container;
    };

    //
    // 🎮 Buttons (clean layout)
    //
    createButton(height / 2 - 120, "ARCADE MODE", "#00ff66", () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("ArcadeModeScene");
      });
    });
    createButton(height / 2 + 10, "2 PLAYER MODE", "#00ff66", () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("TwoPlayerModeScene");
      });
    });
    createButton(height / 2 + 140, "← BACK", "#ff4444", () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MenuScene");
      });
    });

    //
    // 💡 Footer (pulse animation)
    //
    const footer = this.add
      .text(width / 2, height - 40, "© 2025 Pinoy Fighter v1.0", {
        fontSize: "18px",
        fill: "#ffffff",
        fontFamily: "Courier New",
      })
      .setOrigin(0.5)
      .setAlpha(0.6);

    this.tweens.add({
      targets: footer,
      alpha: { from: 0.5, to: 1 },
      duration: 2000,
      repeat: -1,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }
}
