import Phaser from "phaser";

export default class LoadingPreloadScene extends Phaser.Scene {
  constructor() {
    super("LoadingPreloadScene");
  }

  preload() {
    const { width, height } = this.cameras.main;

    // Background tint
    const bg = this.add.image(width / 2, height / 2, "bg");
    bg.setTint(0x888888);

    this.add.image(width / 2, 100, "logo");

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.9);
    progressBox.fillRoundedRect(width / 4, height / 2 - 15, width / 2, 30, 6);

    const percentText = this.add.text(width / 2, height / 2 + 25, "0%", {
      fontSize: "20px",
      fill: "#ffffff",
      fontStyle: "bold",
      fontFamily: "Arial",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5);

    let displayedPercent = 0;
    let targetPercent = 0;

    this.load.on("progress", (value) => targetPercent = Math.floor(value * 100));
    this.load.on("complete", () => targetPercent = 100);

    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (displayedPercent < targetPercent) {
          displayedPercent++;
          percentText.setText(displayedPercent + "%");
          progressBar.clear();
          progressBar.fillStyle(0xffffff, 1);
          progressBar.fillRoundedRect(width / 4 + 2, height / 2 - 13, ((width / 2 - 4) * displayedPercent) / 100, 26, 4);
        }
        if (displayedPercent >= 100) {
          this.time.delayedCall(500, () => {
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
            this.scene.start("MenuScene");
          });
        }
      }
    });
  }
}
