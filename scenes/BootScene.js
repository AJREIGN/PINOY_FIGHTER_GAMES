import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("logo", "assets/images/phaser-logo.png");
    this.load.image("bg", "assets/images/background.png");
    
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    this.add.image(width / 2, height / 2, "bg").setOrigin(0.5);

    // Logo in center
    const logo = this.add.image(width / 2, height / 2, "logo").setScale(0);

    // Bounce animation
    this.tweens.add({
      targets: logo,
      scale: 1,
      duration: 5000,
      ease: "Back.Out",
    });

    // Slide up after delay
    this.time.delayedCall(6000, () => {
  this.tweens.add({
    targets: logo,
    y: 100,
    duration: 2000,
    ease: "Power2",
    onComplete: () => this.scene.start("PreloadScene") // go to loading screen first
  });
});
  }
}
