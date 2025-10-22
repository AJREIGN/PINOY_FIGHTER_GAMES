import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() { super("PreloadScene"); }

  preload() {
    const { width, height } = this.cameras.main;
    const bg = this.add.image(width / 2, height / 2, "bg").setTint(0x777777);
    this.add.image(width / 2, 100, "logo");

    this.load.image("fighter", "assets/sprites/figter_idle.gif");
    this.load.audio("hit", "assets/sounds/hit.mp3");
    this.load.on("complete", () => this.createTapButton());
  }

  createTapButton() {
    const { width, height } = this.cameras.main;
    const boxWidth = 220, boxHeight = 70;

    const container = this.add.container(width / 2, height / 2);

    const box = this.add.graphics();
    box.fillStyle(0x222222, 0.85);
    box.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 12);

    const tapText = this.add.text(0, 0, "Tap to Play", {
      fontSize: "28px",
      fill: "#00ff00",
      fontStyle: "bold",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5);

    container.add([box, tapText]);
    container.setSize(boxWidth, boxHeight);
    container.setInteractive();

    // Pulse tween
    this.tweens.add({ targets: tapText, alpha: { from: 0.5, to: 1 }, yoyo: true, repeat: -1, duration: 800 });

    // Hover effect
    container.on("pointerover", () => {
      box.clear();
      box.fillStyle(0x444444, 0.9);
      box.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 12);
    });
    container.on("pointerout", () => {
      box.clear();
      box.fillStyle(0x222222, 0.85);
      box.fillRoundedRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 12);
    });

    // Tap animation with sound effect (optional)
    container.on("pointerdown", () => {
      this.tweens.add({
        targets: container,
        scale: 0.9,
        duration: 100,
        yoyo: true,
        onComplete: () => this.scene.start("LoadingPreloadScene")
      });
    });
  }
}
