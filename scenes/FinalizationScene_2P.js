import Phaser from "phaser";

export default class FinalizationScene_2P extends Phaser.Scene {
    constructor() {
        super("FinalizationScene_2P");
    }

    init(data) {
        this.player1Character = data.player1Character;
        this.player2Character = data.player2Character;
        this.selectedStage = data.selectedStage;

        this.charList = [
            { key: this.player1Character },
            { key: this.player2Character }
        ];
    }

    preload() {
        // 🔹 Stage image
        const stageMap = {
            "Kabukiran": "carbon_market",
            "Lasang": "lasang",
            "Kapatagan": "kapatagan",
            "Takipsilim": "takipsilim"
        };
        const stageFile = stageMap[this.selectedStage] || "carbon_market";
        this.load.image("stageBG", "/assets/stages/" + stageFile + ".png");

        // 🔹 Player spritesheets
        const charSheets = ["idle", "run", "jump", "fall", "attack1", "attack2", "special", "hit", "death"];
        charSheets.forEach(sheet => {
            this.load.spritesheet(
                "player1_" + sheet,
                "/assets/characters/" + this.player1Character + "/" + sheet + ".png",
                { frameWidth: 180, frameHeight: 180 }
            );
            this.load.spritesheet(
                "player2_" + sheet,
                "/assets/characters/" + this.player2Character + "/" + sheet + ".png",
                { frameWidth: 180, frameHeight: 180 }
            );
        });
    }

    create() {
        const { width, height } = this.cameras.main;

        // 🌌 Stage background
        this.add.image(width / 2, height / 2, "stageBG").setDisplaySize(width, height);

        // 🧍 Player sprites
        const player1X = width * 0.25;
        const player2X = width * 0.75;
        const y = height - 150;

        this.player1Sprite = this.add.sprite(player1X, y, "player1_idle").setScale(2);
        this.player2Sprite = this.add.sprite(player2X, y, "player2_idle").setScale(2);

        // 🔹 Create animations for each player
        this.createAnimations("player1");
        this.createAnimations("player2");

        // ✅ Play idle animations
        this.player1Sprite.play("player1_idle");
        this.player2Sprite.play("player2_idle");

        // 🏷️ Display player names
        this.add.text(player1X, y + 120, this.player1Character, {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#00ffff",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(player2X, y + 120, this.player2Character, {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#ff5555",
            stroke: "#000000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // 🔘 START button
        const startBtn = this.add.text(width / 2, height - 80, "START", {
            fontSize: "36px",
            fontFamily: "Arial Black",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 6
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on("pointerover", () => startBtn.setScale(1.1));
        startBtn.on("pointerout", () => startBtn.setScale(1));
        startBtn.on("pointerdown", () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.scene.start("FightScene_2P", {
                    selectedStage: this.selectedStage,
                    player1Character: this.player1Character,
                    player2Character: this.player2Character
                });
            });
        });
    }

    createAnimations(prefix) {
        const frames = { idle: 8, run: 8, jump: 2, fall: 2, attack1: 5, attack2: 5, special: 5, hit: 3, death: 8 };
        Object.keys(frames).forEach(anim => {
            const frameCount = frames[anim];
            const rate = anim.includes("attack") ? 8 : anim === "hit" ? 6 : 10;
            const repeat = anim === "idle" || anim === "run" ? -1 : 0;
            this.anims.create({
                key: prefix + "_" + anim,
                frames: this.anims.generateFrameNumbers(prefix + "_" + anim, { start: 0, end: frameCount - 1 }),
                frameRate: rate,
                repeat
            });
        });
    }
}
