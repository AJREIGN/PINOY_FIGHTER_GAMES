import Phaser from "phaser";

export default class FightScene_2P extends Phaser.Scene {
    constructor() {
        super("FightScene_2P");
    }

    init(data) {
        this.selectedStage = data.selectedStage;
        this.player1Character = data.player1Character || "hunter";
        this.player2Character = data.player2Character || "panday";

        this.player1 = null;
        this.player2 = null;

        this.p1Wins = data.p1Wins || 0;
        this.p2Wins = data.p2Wins || 0;
        this.round = data.round || 1;
        this.fightStarted = false;
    }

    preload() {
        const stageMap = {
            "Kabukiran": "carbon_market",
            "Lasang": "lasang",
            "Kapatagan": "kapatagan",
            "Takipsilim": "takipsilim",
        };
        const stageFile = stageMap[this.selectedStage] || "carbon_market";
        this.load.image("stageBG", "/assets/stages/" + stageFile + ".png");
        this.load.image("ground", "/assets/stages/ground.png");

        const charSheets = ["idle","run","jump","fall","attack1","attack2","special","hit","death"];

        charSheets.forEach(sheet => {
            this.load.spritesheet(
                "p1_" + sheet,
                "/assets/characters/" + this.player1Character + "/" + sheet + ".png",
                { frameWidth: 180, frameHeight: 180 }
            );
        });

        charSheets.forEach(sheet => {
            this.load.spritesheet(
                "p2_" + sheet,
                "/assets/characters/" + this.player2Character + "/" + sheet + ".png",
                { frameWidth: 180, frameHeight: 180 }
            );
        });
    }

    create() {
        const { width, height } = this.cameras.main;
        this.add.image(width/2, height/2, "stageBG").setDisplaySize(width, height);
        this.physics.world.setBounds(0, 0, width, height);

        const groundY = height - 80;
        const ground = this.physics.add.staticSprite(width/2, groundY - 55, "ground").setScale(1);
        ground.refreshBody();

        this.player1 = this.createCharacter(300, groundY-100, "p1");
        this.player2 = this.createCharacter(width-300, groundY-100, "p2");

        this.physics.add.collider(this.player1, ground);
        this.physics.add.collider(this.player2, ground);

        this.keysP1 = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.SPACE,
            attack1: Phaser.Input.Keyboard.KeyCodes.J,
            attack2: Phaser.Input.Keyboard.KeyCodes.K,
            special: Phaser.Input.Keyboard.KeyCodes.L
        });

        this.keysP2 = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            up: Phaser.Input.Keyboard.KeyCodes.UP,
            attack1: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE,
            attack2: Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,
            special: Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE
        });

        this.setupHealthBars(width);
        this.timeLimit = 60;
        this.timerText = this.add.text(width/2, 40, this.timeLimit, {
            fontFamily: "Arial Black", fontSize: 28, color: "#ffff00", stroke: "#000", strokeThickness: 6
        }).setOrigin(0.5);

        this.readyText = this.add.text(width/2, height/2, "", {
            fontFamily: "Arial Black", fontSize: 60, color: "#ffffff", stroke: "#000", strokeThickness: 8
        }).setOrigin(0.5).setDepth(10);

        this.showRoundText();
    }

    showRoundText() {
        const { width, height } = this.cameras.main;
        this.fightStarted = false;
        this.player1.body.moves = false;
        this.player2.body.moves = false;

        this.roundText = this.add.text(width/2, height/2 - 100, "ROUND " + this.round, {
            fontFamily: "Arial Black",
            fontSize: 72,
            color: "#ffff00",
            stroke: "#000",
            strokeThickness: 10
        }).setOrigin(0.5).setDepth(10);

        this.time.delayedCall(1500, () => {
            this.roundText.setVisible(false);
            this.startCountdown();
        });
    }

    startCountdown() {
        const sequence = ["READY", "3", "2", "1", "FIGHT!"];
        let i = 0;
        this.time.addEvent({
            delay: 1000,
            repeat: sequence.length - 1,
            callback: () => {
                this.readyText.setText(sequence[i]);
                if (sequence[i] === "FIGHT!") {
                    this.time.delayedCall(500, () => {
                        this.readyText.setVisible(false);
                        this.startFightTimer();
                        this.fightStarted = true;
                        this.player1.body.moves = true;
                        this.player2.body.moves = true;
                    });
                }
                i++;
            }
        });
    }

    startFightTimer() {
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (!this.fightStarted) return;
                this.timeLimit--;
                this.timerText.setText(this.timeLimit);
                if (this.timeLimit <= 0) {
                    this.endFight("draw");
                }
            }
        });
    }

    createCharacter(x, y, prefix) {
        const char = this.physics.add.sprite(x, y, prefix + "_idle").setScale(2).setCollideWorldBounds(true);
        char.body.setGravityY(1000);
        char.body.setDragX(600);
        char.body.setMaxVelocity(300, 800);
        char.maxHealth = 100;
        char.health = 100;
        char.isDead = false;
        char.isAttacking = false;

        this.createAnimations(prefix);
        char.play(prefix + "_idle");
        return char;
    }

    createAnimations(prefix) {
        const frameSets = { idle:8, run:8, jump:2, fall:2, attack1:5, attack2:5, special:5, hit:3, death:8 };
        Object.keys(frameSets).forEach(anim => {
            const frameCount = frameSets[anim];
            const rate = anim.includes("attack") ? 8 : anim==="hit" ? 6 : 10;
            const repeat = (anim==="idle"||anim==="run") ? -1 : 0;
            this.anims.create({
                key: prefix + "_" + anim,
                frames: this.anims.generateFrameNumbers(prefix + "_" + anim, { start: 0, end: frameCount - 1 }),
                frameRate: rate,
                repeat
            });
        });
    }

    setupHealthBars(width){
        const barWidth = 325, barHeight = 20;

        this.p1HealthBG = this.add.rectangle(40,40,barWidth,barHeight+8,0x222222).setOrigin(0,0.5).setStrokeStyle(3,0xffffff);
        this.p1Health = this.add.rectangle(40,40,barWidth,barHeight,0x00ff00).setOrigin(0,0.5);

        this.p2HealthBG = this.add.rectangle(width-40,40,barWidth,barHeight+8,0x222222).setOrigin(1,0.5).setStrokeStyle(3,0xffffff);
        this.p2Health = this.add.rectangle(width-40,40,barWidth,barHeight,0xff0000).setOrigin(1,0.5);

        this.p1Name = this.add.text(40, 70, "PLAYER 1", {
            fontFamily: "Arial Black", fontSize: 24, color: "#00ffff", stroke: "#000", strokeThickness: 6
        }).setOrigin(0,0.5);

        this.p2Name = this.add.text(width-40, 70, "PLAYER 2", {
            fontFamily: "Arial Black", fontSize: 24, color: "#ff5555", stroke: "#000", strokeThickness: 6
        }).setOrigin(1,0.5);

        this.vsText = this.add.text(width/2, 70, "VS", {
            fontFamily: "Arial Black", fontSize: 30, color: "#ffffff", stroke: "#000", strokeThickness: 8
        }).setOrigin(0.5);
    }

    update(){
        if(!this.fightStarted) return;
        this.handleAutoFace();
        this.handlePlayerInput(this.player1, this.keysP1, "p1");
        this.handlePlayerInput(this.player2, this.keysP2, "p2");
        this.updateUI();
    }

    handleAutoFace(){
        if(this.player1.x < this.player2.x){
            this.player1.flipX=false;
            this.player2.flipX=true;
        } else {
            this.player1.flipX=true;
            this.player2.flipX=false;
        }
    }

    handlePlayerInput(player, keys, prefix){
        const speed = 220, jumpForce = -650;
        if(keys.left.isDown){
            player.setAccelerationX(-speed*2);
            if(player.body.onFloor() && !player.isAttacking) player.play(prefix+"_run",true);
        } else if(keys.right.isDown){
            player.setAccelerationX(speed*2);
            if(player.body.onFloor() && !player.isAttacking) player.play(prefix+"_run",true);
        } else {
            player.setAccelerationX(0);
            if(player.body.onFloor() && !player.isAttacking) player.play(prefix+"_idle",true);
        }

        if(keys.up.isDown && player.body.onFloor()){
            player.setVelocityY(jumpForce);
            player.play(prefix+"_jump",true);
        }

        if(!player.body.onFloor() && player.body.velocity.y > 0 && !player.isAttacking){
            player.play(prefix+"_fall",true);
        }

        if(Phaser.Input.Keyboard.JustDown(keys.attack1)) this.queueAttack(player, prefix, "attack1", 7);
        if(Phaser.Input.Keyboard.JustDown(keys.attack2)) this.queueAttack(player, prefix, "attack2", 10);
        if(Phaser.Input.Keyboard.JustDown(keys.special)) this.queueAttack(player, prefix, "special", 15);
    }

    queueAttack(player, prefix, type, damage){
        if(player.isDead) return;
        player.isAttacking = true;
        player.play(prefix + "_" + type, true);

        const target = player === this.player1 ? this.player2 : this.player1;

        this.time.delayedCall(200, () => {
            if (Phaser.Math.Distance.Between(player.x, player.y, target.x, target.y) < 120) {
                this.hitCharacter(player, target, damage);
            }
        });

        this.time.delayedCall(600, () => {
            if(!player.isDead){
                player.isAttacking = false;
                player.play(prefix + "_idle", true);
            }
        });
    }

    hitCharacter(attacker, target, damage){
        if(target.isDead) return;
        target.health -= damage;
        if(target.health < 0) target.health = 0;

        target.play(target === this.player1 ? "p1_hit" : "p2_hit", true);
        target.setTint(0xff0000);
        this.time.delayedCall(100,()=>target.clearTint());
        this.updateUI();

        if(target.health <= 0){
            target.isDead = true;
            target.play(target === this.player1 ? "p1_death" : "p2_death", true);
            this.time.delayedCall(1200, () => {
                this.endFight(attacker === this.player1 ? "p1" : "p2");
            });
        }
    }

    updateUI(){
        this.p1Health.width = (this.player1.health/this.player1.maxHealth)*325;
        this.p2Health.width = (this.player2.health/this.player2.maxHealth)*325;
    }

    endFight(winner){
        this.fightStarted = false;
        let text = "";
        if(winner === "p1"){
            this.p1Wins++;
            text = "PLAYER 1 WINS ROUND!";
        } else if(winner === "p2"){
            this.p2Wins++;
            text = "PLAYER 2 WINS ROUND!";
        } else {
            text = "DRAW!";
        }

        const msg = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, text, {
            fontFamily: "Arial Black",
            fontSize: 64,
            color: "#ffffff",
            stroke: "#000",
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(10);

        this.time.delayedCall(2500, ()=>{
            if(this.p1Wins >= 2 || this.p2Wins >= 2){
                let final = this.p1Wins >= 2 ? "PLAYER 1 \n WINS MATCH!" : "PLAYER 2 \n WINS MATCH!";
                msg.setText(final);
                this.time.delayedCall(3000, ()=> this.scene.start("MainMenuScene"));
            } else {
                this.scene.restart({
                    selectedStage: this.selectedStage,
                    player1Character: this.player1Character,
                    player2Character: this.player2Character,
                    p1Wins: this.p1Wins,
                    p2Wins: this.p2Wins,
                    round: this.round + 1
                });
            }
        });
    }
}
