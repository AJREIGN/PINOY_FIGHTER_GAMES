import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.cameras.main;

    //
    // 🌌 BACKGROUND IMAGE
    //
    const bg = this.add.image(width / 2, height / 2, "bg");
    bg.setDisplaySize(width, height);
    bg.setAlpha(0.9);
    bg.setDepth(-2);

    //
    // 🪩 FLOATING LOGO
    //
    const logo = this.add.image(width / 2, 140, "logo").setScale(0.9).setAlpha(0);
    this.tweens.add({
      targets: logo,
      alpha: 1,
      duration: 1000,
      ease: "Sine.easeOut",
    });
    this.tweens.add({
      targets: logo,
      y: { from: 110, to: 130 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    //
    // 🏷️ GAME TITLE
    //
    const title = this.add.text(width / 2, 250, "", {
      fontSize: "58px",
      fill: "#00ffcc",
      fontFamily: "Impact",
      stroke: "#000000",
      strokeThickness: 8,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: "#003333",
        blur: 12,
        fill: true,
      },
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 1000,
      ease: "Sine.easeInOut",
      delay: 400,
    });

    //
    // 🎨 BUTTON CREATOR (CLEAN GLOW STYLE)
    //
    const createButton = (y, label, color, onClick) => {
      const boxWidth = 320, boxHeight = 85;
      const container = this.add.container(width / 2, y);

      // Glass-like box
      const box = this.add.graphics();
      box.fillStyle(0x111111, 0.85);
      box.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 20);
      box.lineStyle(3, 0xffffff, 0.15);
      box.strokeRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 20);

      const text = this.add.text(0, 0, label, {
        fontSize: "32px",
        fill: color,
        fontFamily: "Arial Black",
        stroke: "#000000",
        strokeThickness: 6,
      }).setOrigin(0.5);

      text.setShadow(0, 0, color, 12, true, true);

      container.add([box, text]);
      container.setSize(boxWidth, boxHeight);
      container.setInteractive({ useHandCursor: true });

      // Hover effect
      container.on("pointerover", () => {
        this.tweens.add({
          targets: container,
          scale: 1.1,
          duration: 200,
          ease: "Back.Out",
        });
        text.setFill("#00ffff");
        text.setShadow(0, 0, "#00ffff", 15, true, true);
      });

      container.on("pointerout", () => {
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 150,
        });
        text.setFill(color);
        text.setShadow(0, 0, color, 12, true, true);
      });

      // Click animation
      container.on("pointerdown", () => {
        this.tweens.add({
          targets: container,
          scale: 0.9,
          duration: 100,
          yoyo: true,
          ease: "Sine.easeOut",
          onComplete: onClick,
        });
      });

      // Fade-in appearance
      container.setAlpha(0);
      this.tweens.add({
        targets: container,
        alpha: 1,
        duration: 700,
        delay: y * 0.25,
        ease: "Sine.easeOut",
      });

      return container;
    };

    //
    // 🎮 MENU BUTTONS
    //
    createButton(height / 2 - 50, "SINGLE PLAYER", "#00ff66", () => {
  this.cameras.main.fadeOut(400, 0, 0, 0);
  this.cameras.main.once("camerafadeoutcomplete", () => {
    this.scene.start("SinglePlayerMenuScene");
  });
});
    createButton(height / 2 + 60, "EXIT", "#ff4444", () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => this.game.destroy(true));
    });

    //
    // 💡 FOOTER TEXT (Subtle Pulse)
    //
    const footer = this.add.text(width / 2, height - 40, "© 2025 Pinoy Fighter v1.0", {
      fontSize: "18px",
      fill: "#ffffff",
      fontFamily: "Courier New",
    }).setOrigin(0.5).setAlpha(0.6);

    this.tweens.add({
      targets: footer,
      alpha: { from: 0.6, to: 1 },
      duration: 2000,
      repeat: -1,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }
}
