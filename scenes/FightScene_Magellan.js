import Phaser from "phaser";

export default class FightScene_Magellan extends Phaser.Scene {
    constructor() {
        super("FightScene_Magellan");
    }

    init(data) {
            this.selectedStage = data.selectedStage;
            this.difficulty = data.difficulty || "normal";
            this.player = null;
            this.enemy = null;
    
            this.playerWins = data.playerWins || 0;
            this.enemyWins = data.enemyWins || 0;
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
                    "player_" + sheet,
                    "/assets/characters/magellan/" + sheet + ".png",
                    { frameWidth: 180, frameHeight: 180 }
                );
            });
    
            const aiChoices = ["panday", "hunter", "LapuLapu"];
            this.aiChar = Phaser.Utils.Array.GetRandom(aiChoices);
            charSheets.forEach(sheet => {
                this.load.spritesheet(
                    "enemy_" + sheet,
                    "/assets/characters/" + this.aiChar + "/" + sheet + ".png",
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
    
            this.player = this.createCharacter(300, groundY-100, "player");
            this.enemy = this.createCharacter(width-300, groundY-100, "enemy", this.aiChar);
    
            this.physics.add.collider(this.player, ground);
            this.physics.add.collider(this.enemy, ground);
    
            this.keys = this.input.keyboard.addKeys({
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D,
                up: Phaser.Input.Keyboard.KeyCodes.SPACE,
                attack1: Phaser.Input.Keyboard.KeyCodes.J,
                attack2: Phaser.Input.Keyboard.KeyCodes.K,
                special: Phaser.Input.Keyboard.KeyCodes.L
            });
    
            this.setupHealthBars(width);
    
            this.timeLimit = 60;
            this.timerText = this.add.text(width/2, 40, this.timeLimit, {
                fontFamily: "Arial Black", fontSize: 28, color: "#ffff00", stroke: "#000", strokeThickness: 6
            }).setOrigin(0.5);
    
            this.fightStarted = false;
    
            this.readyText = this.add.text(width/2, height/2, "", {
                fontFamily: "Arial Black", fontSize: 60, color: "#ffffff", stroke: "#000", strokeThickness: 8
            }).setOrigin(0.5).setDepth(10);
             // 🟢 Add round announcement before countdown
            this.showRoundText();
            if (this.difficulty === "easy") {
                this.enemySpeed = 160;
                this.enemyDamage = 5;
                this.enemyAggro = 3;
            } else if (this.difficulty === "normal") {
                this.enemySpeed = 220;
                this.enemyDamage = 10;
                this.enemyAggro = 6;
            } else if (this.difficulty === "hard") {
                this.enemySpeed = 280;
                this.enemyDamage = 15;
                this.enemyAggro = 10;
            }
        }
    
        showRoundText() {
            const { width, height } = this.cameras.main;
            this.fightStarted = false;
            this.player.body.moves = false;
            this.enemy.body.moves = false;
            this.playerFrozen = true;
            this.enemyFrozen = true;
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
    
                            this.player.body.moves = true;
                            this.enemy.body.moves = true;
                            this.playerFrozen = false;
                            this.enemyFrozen = false;
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
                        this.timeLimit = 0;
                        this.endFight("TIME OVER!");
                    }
                }
            });
        }
    
        createCharacter(x, y, prefix, enemyType=null) {
            const char = this.physics.add.sprite(x, y, prefix + "_idle").setScale(2).setCollideWorldBounds(true);
            char.body.setGravityY(1000);
            char.body.setDragX(600);
            char.body.setMaxVelocity(300, 800);
            char.maxHealth = 100;
            char.health = 100;
            char.isDead = false;
            char.isAttacking = false;
            char.comboCount = 0;
    
            this.createAnimations(prefix, enemyType);
            char.play(prefix + "_idle");
            return char;
        }
    
        createAnimations(prefix, enemyType=null) {
            const playerFrames = { idle:10, run:6, jump:2, fall:2, attack1:4, attack2:4, special:5, hit:3, death:9 };
            const enemyFramesMap = {
                panday: { idle:4, run:6, jump:2, fall:2, attack1:6, attack2:6, special:8, hit:3, death:6 },
                hunter:   { idle:8, run:8, jump:2, fall:2, attack1:5, attack2:5, special:5, hit:3, death:8 },
                LapuLapu: { idle:10, run:8, jump:3, fall:3, attack1:7, attack2:7, special:8, hit:3, death:7 }
            };
            const frames = enemyType ? enemyFramesMap[enemyType] : playerFrames;
    
            Object.keys(frames).forEach(anim => {
                const frameCount = frames[anim];
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
    
            this.playerHealthBarBG = this.add.rectangle(40,40,barWidth,barHeight+8,0x222222).setOrigin(0,0.5).setStrokeStyle(3,0xffffff);
            this.playerHealthBar = this.add.rectangle(40,40,barWidth,barHeight,0x00ff00).setOrigin(0,0.5);
    
            this.enemyHealthBarBG = this.add.rectangle(width-40,40,barWidth,barHeight+8,0x222222).setOrigin(1,0.5).setStrokeStyle(3,0xffffff);
            this.enemyHealthBar = this.add.rectangle(width-40,40,barWidth,barHeight,0xff0000).setOrigin(1,0.5);
    
            this.playerName = this.add.text(40, 70, "MAGELLAN", {
                fontFamily: "Arial Black", fontSize: 24, color: "#00ffff", stroke: "#000", strokeThickness: 6
            }).setOrigin(0,0.5);
    
            this.enemyName = this.add.text(width-40, 70, this.aiChar.toUpperCase(), {
                fontFamily: "Arial Black", fontSize: 24, color: "#ff5555", stroke: "#000", strokeThickness: 6
            }).setOrigin(1,0.5);
    
            this.vsText = this.add.text(width/2, 70, "VS", {
                fontFamily: "Arial Black", fontSize: 30, color: "#ffffff", stroke: "#000", strokeThickness: 8
            }).setOrigin(0.5);
        }
    
        updateUI(){
            this.playerHealthBar.width = (this.player.health/this.player.maxHealth)*325;
            this.enemyHealthBar.width = (this.enemy.health/this.enemy.maxHealth)*325;
        }
    
        queueAttack(char,type,damage){
            if(char.isDead) return;
            char.isAttacking = true;
    
            const isJump = (type==="jumpAttack");
            const animKey = isJump ? (char===this.player?"player_attack1":"enemy_attack1")
                                   : type==="attack1" ? (char===this.player?"player_attack1":"enemy_attack1")
                                   : type==="attack2" ? (char===this.player?"player_attack2":"enemy_attack2")
                                   : (char===this.player?"player_special":"enemy_special");
    
            char.play(animKey, true);
    
            const target = char===this.player ? this.enemy : this.player;
    
            this.time.delayedCall(200, () => {
                if(isJump ? !target.body.onFloor() : target.body.onFloor()) {
                    this.hitCharacter(char,target,damage);
                }
            });
    
            this.time.delayedCall(500, () => {
                if(!char.isDead) char.isAttacking=false;
                char.play(char===this.player?"player_idle":"enemy_idle",true);
            });
        }
    
        hitCharacter(attacker, target, damage){
            if(target.isDead) return;
            target.health -= damage;
            if(target.health < 0) target.health = 0;
    
            if(!target.isDead){
                target.play(target===this.player?"player_hit":"enemy_hit",true);
            }
    
            target.setTint(0xff0000);
            this.time.delayedCall(100,()=>target.clearTint());
    
            if(target===this.player) this.playerHealthBar.width = (target.health/target.maxHealth)*325;
            else this.enemyHealthBar.width = (target.health/target.maxHealth)*325;
    
            if(target.health <=0){
                target.isDead = true;
                target.setVelocity(0);
                target.play(target===this.player?"player_death":"enemy_death",true);
    
                let deathAnim = target.anims.currentAnim;
                let frameRate = deathAnim ? deathAnim.frameRate : 10;
                let frameCount = deathAnim ? deathAnim.frames.length : 6;
                let deathAnimDuration = (frameCount / frameRate) * 1000;
    
                this.time.delayedCall(deathAnimDuration, ()=> {
                    this.endFight(target===this.player?"enemy":"player");
                });
            }
        }
    
        handleAutoFace(){
            if(this.player.x < this.enemy.x){ this.player.flipX=false; this.enemy.flipX=true; }
            else { this.player.flipX=true; this.enemy.flipX=false; }
        }
    
        handlePlayerInput(){
            const speed = 220, jumpForce = -650;
            const { left, right, up, attack1, attack2, special } = this.keys;
    
            if(left.isDown){
                this.player.setAccelerationX(-speed*2);
                if(this.player.body.onFloor() && !this.player.isAttacking) this.playAnimation(this.player, "player_run");
            } else if(right.isDown){
                this.player.setAccelerationX(speed*2);
                if(this.player.body.onFloor() && !this.player.isAttacking) this.playAnimation(this.player, "player_run");
            } else {
                this.player.setAccelerationX(0);
                if(this.player.body.onFloor() && !this.player.isAttacking) this.playAnimation(this.player, "player_idle");
            }
    
            if(up.isDown && this.player.body.onFloor()){
                this.player.setVelocityY(jumpForce);
                if(!this.player.isAttacking) this.playAnimation(this.player, "player_jump");
            }
    
            if(!this.player.body.onFloor() && this.player.body.velocity.y > 0 && !this.player.isAttacking){
                this.playAnimation(this.player, "player_fall");
            }
    
            if(Phaser.Input.Keyboard.JustDown(attack1)) this.queueAttack(this.player, this.player.body.onFloor() ? "attack1" : "jumpAttack", 5);
            if(Phaser.Input.Keyboard.JustDown(attack2)) this.queueAttack(this.player, this.player.body.onFloor() ? "attack2" : "jumpAttack", 7);
            if(Phaser.Input.Keyboard.JustDown(special)) this.queueAttack(this.player, this.player.body.onFloor() ? "special" : "jumpAttack", 15);
        }
    
        handleEnemyAI(){
            if(this.enemy.isDead) return;
            const aiSpeed = this.enemySpeed;
            const dist = this.player.x - this.enemy.x;
            const absDist = Math.abs(dist);
    
            if(this.enemy.body.onFloor() && this.player.y < this.enemy.y && Math.random() < 0.01){
                this.enemy.setVelocityY(-650);
                this.playAnimation(this.enemy, "enemy_jump");
            }
    
            let attackChance = this.enemyAggro;
            if(!this.enemy.isAttacking && absDist < 130 && Phaser.Math.Between(0,100) < attackChance){
                const attackType = Phaser.Math.Between(0,10) < 7 ? "attack1" : "special";
                const damage = attackType === "attack1" ? this.enemyDamage : this.enemyDamage + 5;
                const type = this.enemy.body.onFloor() ? attackType : "jumpAttack";
                this.queueAttack(this.enemy, type, damage);
            }
    
            if(absDist > 50){
                this.enemy.setAccelerationX(dist > 0 ? aiSpeed : -aiSpeed);
                if(this.enemy.body.onFloor() && !this.enemy.isAttacking) this.playAnimation(this.enemy, "enemy_run");
            } else {
                this.enemy.setAccelerationX(0);
                if(this.enemy.body.onFloor() && !this.enemy.isAttacking) this.playAnimation(this.enemy, "enemy_idle");
            }
        }
    
        playAnimation(char, animKey) {
            if(char.anims.currentAnim && char.anims.currentAnim.key === animKey) return;
            char.play(animKey, true);
        }
    
        update(){
            this.handleAutoFace();
            this.handlePlayerInput();
            this.handleEnemyAI();
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
                let finalText = this.playerWins >= 2 ? "PLAYER WINS \n THE MATCH!" : "ENEMY WINS \n THE MATCH!";
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
