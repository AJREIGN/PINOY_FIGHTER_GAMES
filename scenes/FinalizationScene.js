import Phaser from "phaser";

export default class FinalizationScene extends Phaser.Scene {
  constructor() {
    super("FinalizationScene");
  }

  init(data) {
    this.selectedCharacter = data.selectedCharacter || "Unknown";
    this.selectedStage = data.selectedStage || "Unknown";
  }

  preload() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor("#000000");

    // Loading bar
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 200, 320, 30);

    const loadingText = this.add.text(width / 2, height / 2 + 160, "LOADING ASSETS...", {
      fontSize: "24px",
      fill: "#00ffff",
      fontFamily: "Arial Black",
    }).setOrigin(0.5);

    this.load.on("progress", function(value) {
      progressBar.clear();
      progressBar.fillStyle(0x00ffcc, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 205, 300 * value, 20);
    });

    this.load.on("complete", function() {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load stage
    const stageMap = {
      "Kabukiran": "carbon_market",
      "Lasang": "lasang",
      "Kapatagan": "kapatagan",
      "Takipsilim": "takipsilim"
    };
    const stageFile = stageMap[this.selectedStage] || "carbon_market";
    this.load.image("finalStageBG", "/assets/stages/" + stageFile + ".png");

    // Load character sprite
    const charMap = {
      "Hunter": "hunter",
      "Lapu-Lapu": "lapulapu",
      "Panday": "panday",
      "Magellan": "magellan"
    };
    const charFolder = charMap[this.selectedCharacter];
    if(charFolder){
      this.load.spritesheet(
        "finalFighter",
        "/assets/characters/" + charFolder + "/idle.png",
        { frameWidth: 180, frameHeight: 180 }
      );
    } else {
      console.warn("Unknown character:", this.selectedCharacter);
    }
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(600, 0, 0, 0);

    const bg = this.add.image(width / 2, height / 2, "finalStageBG").setDisplaySize(width, height);

    // Final fighter animation
    this.anims.create({
      key: "finalIdle",
      frames: this.anims.generateFrameNumbers("finalFighter", { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    const fighter = this.add.sprite(width / 2, height / 2, "finalFighter").play("finalIdle");

    const scaleByCharacter = {
      "Hunter": 4.5,
      "Lapu-Lapu": 4.8,
      "Panday": 4.2,
      "Magellan": 4.5
    };
    fighter.setScale(scaleByCharacter[this.selectedCharacter] || 3);
    fighter.setAlpha(0);
    this.tweens.add({ targets: fighter, alpha: 1, duration: 1000 });

    // Character name and stage
    this.add.text(width / 2, height * 0.12, this.selectedCharacter, {
      fontSize: "48px",
      fill: "#00ffff",
      stroke: "#000",
      strokeThickness: 6,
      fontFamily: "Impact"
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.22, "STAGE: " + this.selectedStage, {
      fontSize: "28px",
      fill: "#ffffff",
      stroke: "#000",
      strokeThickness: 4,
      fontFamily: "Arial Black"
    }).setOrigin(0.5);

    // Difficulty Selection
    this.add.text(width / 2, height * 0.7, "SELECT DIFFICULTY", {
      fontSize: "30px",
      fill: "#00ffff",
      fontFamily: "Arial Black"
    }).setOrigin(0.5);

    const difficulties = ["Normal", "Hard"];
    const buttonY = height * 0.78;

    for (let i = 0; i < difficulties.length; i++) {
      const level = difficulties[i];
      const btnText = this.add.text(width / 2, buttonY + i * 60, level, {
        fontSize: "20px",
        fill: "#ffffff",
        fontFamily: "Impact",
        backgroundColor: "#111111",
        padding: { x: 20, y: 10 },
        align: "center"
      }).setOrigin(0.5);

      btnText.setInteractive({ useHandCursor: true })
        .on("pointerover", function() { btnText.setStyle({ fill: "#00ff99" }); })
        .on("pointerout", function() { btnText.setStyle({ fill: "#ffffff" }); })
        .on("pointerdown", () => this.startFight(level.toLowerCase()));
    }
  }

  startFight(difficulty) {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      var nextScene = {
        "Hunter": "FightScene_manigbasay",
        "Lapu-Lapu": "FightScene_LapuLapu",
        "Panday": "FightScene_Panday",
        "Magellan": "FightScene_Magellan"
      }[this.selectedCharacter] || "FightScene_Juan";

      this.scene.start(nextScene, {
        selectedCharacter: this.selectedCharacter,
        selectedStage: this.selectedStage,
        difficulty: difficulty
      });
    });
  }
}
