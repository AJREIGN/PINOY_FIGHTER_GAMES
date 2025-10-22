import Phaser from "phaser";

export default class FightScene_Panday extends Phaser.Scene {
    constructor() {
        super("FightScene_Panday");
    }

    endFight(winner) {
    this.fightStarted = false;
    this.player.body.moves = false;
    this.enemy.body.moves = false;

    let text = "";
    let deathAnimDuration = 1500;

    if (winner === "player") {
        this.enemy.isDead = true;
        this.enemy.play("enemy_death", true);
        text = "PLAYER WINS ROUND!";
        this.playerWins++;
    } else if (winner === "enemy") {
        this.player.isDead = true;
        this.player.play("player_death", true);
        text = "ENEMY WINS ROUND!";
        this.enemyWins++;
    } else if (winner === "draw") {
        // 🟡 Both die
        this.player.isDead = true;
        this.enemy.isDead = true;
        this.player.play("player_death", true);
        this.enemy.play("enemy_death", true);
        text = "DRAW!";
    }

    // Delay text until deaths finish
    this.time.delayedCall(deathAnimDuration, () => {
        this.resultText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            text,
            {
                fontFamily: "Arial Black",
                fontSize: 64,
                color: "#ffffff",
                stroke: "#000",
                strokeThickness: 8
            }
        ).setOrigin(0.5).setDepth(10);

        this.time.delayedCall(2000, () => {
            // If someone wins the match (best of 3)
            if (this.playerWins >= 2 || this.enemyWins >= 2) {
                let finalText = this.playerWins >= 2 ? "PLAYER WINS THE MATCH!" : "ENEMY WINS THE MATCH!";
                this.resultText.setText(finalText);
                this.time.delayedCall(3000, () => {
                    this.scene.start("SinglePlayerMenuScene");
                });
            } else {
                this.time.delayedCall(2000, () => {
                    this.scene.restart({
                        selectedStage: this.selectedStage,
                        difficulty: this.difficulty,
                        playerWins: this.playerWins,
                        enemyWins: this.enemyWins,
                        round: this.round + 1
                    });
                });
            }
        });
    });
}
}
