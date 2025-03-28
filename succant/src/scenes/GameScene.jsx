// scenes/GameScene.js
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor(onScoreUpdate) {
    super({ key: "GameScene" });
    this.onScoreUpdate = onScoreUpdate;
  }

  preload() {
    this.load.image("player", "/assets/player.png");
    this.load.image("enemy1", "/assets/enemy1.png");
    this.load.image("enemy2", "/assets/enemy2.png");
    this.load.image("enemy3", "/assets/enemy3.png");
    this.load.image("enemy4", "/assets/enemy4.png");
    this.load.image("enemy5", "/assets/enemy5.png");
    this.load.image("enemy6", "/assets/enemy6.png");
    this.load.image("enemy7", "/assets/enemy7.png");
    this.load.image("enemy8", "/assets/enemy8.png");
    this.load.image("enemy9", "/assets/enemy9.png");
    this.load.image("projectile", "/assets/bullet.png");
    this.load.image("background", "/assets/bg.jpg");
    this.load.image("exp_orb", "/assets/orb.png");
    this.load.image("turret1", "/assets/turret1.png");
    this.load.image("turret2", "/assets/turret2.png");
    this.load.image("turret3", "/assets/turret3.png");
    this.load.image("claw", "/assets/claw.png");

    this.load.audio("turret", "/assets/turretsound.mp3");
    this.load.audio("bg", "/assets/sigmaboy.mp3");
    this.load.audio("hit", "/assets/hit.mp3");
    this.load.audio("shot", "/assets/shot.mp3");
    this.load.audio("shotgunshot", "/assets/shotgunshot.mp3");
    this.load.audio("hurt", "/assets/hurt.mp3");
    this.load.audio("boss", "/assets/bosstheme.mp3");
    this.load.audio("siren", "/assets/siren.mp3");
    this.load.audio("walk", "/assets/walk.mp3");
    this.load.audio("boss1", "/assets/boss1.mp3");
    this.load.audio("boss2", "/assets/boss2.mp3");
    this.load.audio("win", "/assets/win.mp3");
    this.load.audio("final", "/assets/final.mp3");
  }

  create() {
    this.blocked = false;
    this.gamePhase = 1;
    this.bossNextAttack = 0;

    this.score = 0;
    this.enemiesKilled = [0,0,0,0,0,0,0,0,0]

    this.playerStats = {
      health: 150,
      maxHealth: 150,
      damage: 12,
      speed: 220,
      attackSpeed: 1.1,
      experience: 0,
      level: 1,
      skillPoints: 0,
      healthRegen: 1,
      isInvincible: false,
      canUpgradeSpecial: false,
      specials: {
        pierce: 0,
        claw: 0,
        shotgun: 0,
        turret: 0,
      },
      lastSpecialUpgradeLevel: 0,
    };

    this.enemies = [];
    this.projectiles = [];
    this.lastFired = 0;
    this.shotgunLastFired = 0;
    this.enemySpawnTime = 0;
    this.gameTime = 0;
    this.kills = 0;
    this.gamePaused = false;
    this.gameOverScreen = false;

    this.add.image(800, 600, "background");

    this.player = this.physics.add.sprite(400, 300, "player");
    this.player.health = this.playerStats.health;
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(15, 15);

    this.enemiesGroup = this.physics.add.group();
    this.projectilesGroup = this.physics.add.group();
    this.experienceOrbsGroup = this.physics.add.group();
    this.turretsGroup = this.physics.add.group();
    this.clawsGroup = this.physics.add.group();

    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.cursors = this.input.keyboard.createCursorKeys();

    this.turretSound = this.sound.add("turret", { volume: 0.5 });
    this.bgSound = this.sound.add("bg", { loop: true, volume: 0.3 });
    this.hitSound = this.sound.add("hit", { volume: 0.5 });
    this.shotSound = this.sound.add("shot", { volume: 0.1 });
    this.shotgunSound = this.sound.add("shotgunshot", { volume: 0.3 });
    this.hurtSound = this.sound.add("hurt");
    this.sirenSound = this.sound.add("siren");
    this.bossBgSound = this.sound.add("boss");
    this.boss1Sound = this.sound.add("boss1");
    this.boss2Sound = this.sound.add("boss2");
    this.walkSound = this.sound.add("walk");
    this.winSound = this.sound.add("win");
    this.finalSound = this.sound.add("final");
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.spaceKey.on("down", () => {
      if (!this.gamePaused) {
        this.gamePaused = true;
        this.scene.pause();
        this.scene.launch("UpgradeScene", {
          skillPoints: this.playerStats.skillPoints,
          playerStats: this.playerStats,
          onContinue: this.continueGame.bind(this),
        });
      }
    });

    this.createUI();

    this.physics.add.collider(
      this.player,
      this.enemiesGroup,
      this.handlePlayerEnemyCollision,
      null,
      this
    );
    this.physics.add.overlap(
      this.projectilesGroup,
      this.enemiesGroup,
      this.handleProjectileEnemyCollision,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.experienceOrbsGroup,
      this.collectExperienceOrb,
      null,
      this
    );
    this.physics.add.overlap(
      this.clawsGroup,
      this.enemiesGroup,
      this.handleClawEnemyCollision,
      null,
      this
    );

    this.physics.world.setBounds(0, 0, 1600, 1200);

    this.cameras.main.setBounds(0, 0, 1600, 1200);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);

    this.cameras.main.setZoom(1);

    this.time.addEvent({
      delay: 1000 / 60,
      callback: this.fixedUpdate,
      callbackScope: this,
      loop: true,
    });
    this.time.addEvent({
      delay: 1000,
      callback: this.regenHealth,
      callbackScope: this,
      loop: true,
    });
    this.bgSound.play();

    this.clawBaseDistance = 65;
  }

  regenHealth() {
    if (this.gamePaused) return;
    this.player.health += this.playerStats.healthRegen;
    if (this.player.health > this.playerStats.maxHealth) {
      this.player.health = this.playerStats.maxHealth;
    }
  }

  fixedUpdate() {
    if (this.gamePaused || this.gameOverScreen) return;
    this.gameTime += 1000 / 60;
    this.timeText.setText(`Time: ${Math.floor(this.gameTime / 1000)}`);
    const currentTime = this.gameTime;

    this.player.setVelocity(0);

    if (!this.blocked) {
      if (this.cursors.left.isDown || this.keys.left.isDown) {
        this.player.setVelocityX(-this.playerStats.speed);
      } else if (this.cursors.right.isDown || this.keys.right.isDown) {
        this.player.setVelocityX(this.playerStats.speed);
      }

      if (this.cursors.up.isDown || this.keys.up.isDown) {
        this.player.setVelocityY(-this.playerStats.speed);
      } else if (this.cursors.down.isDown || this.keys.down.isDown) {
        this.player.setVelocityY(this.playerStats.speed);
      }

      if (
        currentTime > this.lastFired &&
        this.enemiesGroup.getChildren().length > 0
      ) {
        this.fireProjectile();
        this.lastFired = currentTime + 1000 / this.playerStats.attackSpeed;
      }

      if (
        this.playerStats.specials.shotgun > 0 &&
        currentTime > this.shotgunLastFired
      ) {
        this.shotgunLastFired =
          currentTime +
          (5500 - 500 * this.playerStats.specials.shotgun) /
            this.playerStats.attackSpeed;
        this.fireShotgun();
      }
    }

    

    if (currentTime > this.enemySpawnTime && this.gamePhase == 1) {
      let level = this.gameTime < 150000 ? 1 : 3;
      if (
        this.gameTime > 25000 &&
        Math.random() < 0.4 + this.gameTime / 1500000
      ) {
        level = 2;
      }
      if (
        this.gameTime > 50000 &&
        Math.random() < 0.3 + this.gameTime / 1500000
      ) {
        level = 3;
      }
      if (
        this.gameTime > 75000 &&
        Math.random() < 0.2 + this.gameTime / 1500000
      ) {
        level = 4;
      }
      if (
        this.gameTime > 110000 &&
        Math.random() < 0.15 + this.gameTime / 1500000
      ) {
        level = 5;
      }
      if (
        this.gameTime > 140000 &&
        Math.random() < 0.1 + this.gameTime / 1500000
      ) {
        level = 6;
      }
      if (
        this.gameTime > 180000 &&
        Math.random() < 0.05 + this.gameTime / 1500000
      ) {
        level = 7;
      }
      if (
        this.gameTime > 225000 &&
        Math.random() < 0.025 + this.gameTime / 1500000
      ) {
        level = 8;
      }
      this.spawnEnemy(level);
      this.enemySpawnTime =
        currentTime +
        Math.max(100, 2000 - Math.floor(this.gameTime / 20000) * 200);
    }

    if (this.gameTime > 260000 && this.gamePhase == 1) {
      this.bgSound.stop();
      this.sirenSound.play();
      setTimeout(() => {
        this.walkSound.play();
      }, 1000);
      for (let i = this.enemiesGroup.getChildren().length - 1; i >= 0; i--) {
        this.enemiesGroup.getChildren()[i].destroy();
      }
      setTimeout(() => {
        this.bossBgSound.play();
        this.spawnEnemy(9);
      }, 10000);
      this.gamePhase = 2;
      this.bossNextAttack = this.gameTime + 15000;
    }

    if (this.gamePhase == 2) {
      this.BossPhase();
    }

    if (this.gamePhase == 3) {
      
      this.winSound.play();
      this.bossBgSound.stop();
      this.gamePhase = 4;

      setTimeout(() => {
        this.finalSound.play();
      }, 3000);

      setTimeout(() => {
        this.StartEnd();
      }, 17000);
    }

    if (this.player.health <= 0) {
      this.handleGameOver();
    }

    if (
      this.playerStats.specials.turret > 0 &&
      this.turretsGroup.getChildren().length === 0
    ) {
      this.spawnTurret();
    }


    if (this.clawsGroup && this.playerStats.specials.claw > 0) {
      const desiredClawCount = this.playerStats.specials.claw;
      const currentClawCount = this.clawsGroup.getChildren().length;

      if (currentClawCount < desiredClawCount) {
        for (let i = this.clawsGroup.getChildren().length - 1; i >= 0; i--) {
          this.clawsGroup.getChildren()[i].destroy();
        }
        for (let i = 0; i < desiredClawCount; i++) {
          this.spawnClaw();
        }
      }

      this.updateClaws();
    }

    this.experienceOrbsGroup.getChildren().forEach((orb) => {
      const dx = this.player.x - orb.x;
      const dy = this.player.y - orb.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedX = distance > 0 ? dx / distance : 0;
      const normalizedY = distance > 0 ? dy / distance : 0;
      const speed = 100; // Adjust speed as necessary
      orb.setVelocity(normalizedX * speed, normalizedY * speed);
    });

    this.updateUI();
  }

  spawnClaw() {
    const angleOffset =
      ((Math.PI * 2) / this.playerStats.specials.claw) *
      this.clawsGroup.getChildren().length;
    const startAngle = this.gameTime * 0.001 + angleOffset;

    const distance =
      this.clawBaseDistance + this.playerStats.specials.claw * 10;

    const x = this.player.x + Math.cos(startAngle) * distance;
    const y = this.player.y + Math.sin(startAngle) * distance;

    const claw = this.clawsGroup.create(x, y, "claw");

    switch (this.playerStats.specials.claw) {
      case 1:
        claw.damage = this.playerStats.damage * 2.5;
        claw.scale = 0.8;
        claw.damageInterval = 500 - this.playerStats.attackSpeed * 15;
        break;
      case 2:
        claw.damage = this.playerStats.damage * 3;
        claw.scale = 1.0;
        claw.damageInterval = 400 - this.playerStats.attackSpeed * 15;
        break;
      case 3:
        claw.damage = this.playerStats.damage * 4;
        claw.scale = 1.3;
        claw.damageInterval = 300 - this.playerStats.attackSpeed * 15;
        break;
    }

    claw.angleOffset = angleOffset;
    claw.angle = startAngle * Phaser.Math.RAD_TO_DEG;
    claw.setScale(claw.scale);
    claw.active = true;
  }

  updateClaws() {
    this.clawsGroup.getChildren().forEach((claw) => {
      if (!claw.active) claw.setTint(0x000000).setAlpha(0.5);
      else claw.clearTint().setAlpha(1);

      const angle =
        this.gameTime * 0.002 * Math.max(1, this.playerStats.attackSpeed / 2) +
        claw.angleOffset;

      const distance =
        this.clawBaseDistance + this.playerStats.specials.claw * 10;

      claw.x = this.player.x + Math.cos(angle) * distance;
      claw.y = this.player.y + Math.sin(angle) * distance;

      claw.angle = angle * Phaser.Math.RAD_TO_DEG + 90;
    });
  }

  handleClawEnemyCollision(claw, enemy) {
    if (claw.active) {
      claw.active = false;

      this.time.delayedCall(claw.damageInterval, () => {
        claw.active = true;
      });

      enemy.health -= claw.damage;

      this.sound.play("hit");

      if (enemy.health <= 0) {
        this.kills++;
        this.killsText.setText(`Kills: ${this.kills}`);
        this.spawnExperienceOrb(enemy.x, enemy.y, enemy.expValue);

        enemy.destroy();
      }
    }
  }

  spawnTurret() {
    let turret = this.turretsGroup.create(
      this.player.x,
      this.player.y,
      `turret${this.playerStats.specials.turret}`
    );
    switch (this.playerStats.specials.turret) {
      case 1:
        turret.attackSpeed = this.playerStats.attackSpeed * 2;
        turret.damage = this.playerStats.damage * 0.35;
        break;
      case 2:
        turret.attackSpeed = this.playerStats.attackSpeed * 2.3;
        turret.damage = this.playerStats.damage * 0.45;
        break;
      case 3:
        turret.attackSpeed = this.playerStats.attackSpeed * 2.7;
        turret.damage = this.playerStats.damage * 0.55;
        break;
    }
    turret.setScale(0.3);
    const firingStartTime = this.gameTime;
    const firingDuration = 15000;

    const fireTurretInterval = () => {
      if (this.gameTime - firingStartTime < firingDuration) {
        if (this.blocked) return;
        this.fireTurret(turret);
        this.time.delayedCall(1100 / turret.attackSpeed, fireTurretInterval);
      } else {
        turret.destroy();
      }
    };

    fireTurretInterval();
  }

  fireTurret(turret) {
    let closestEnemy = null;
    let closestDistance = Infinity;

    this.enemiesGroup.getChildren().forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        turret.x,
        turret.y,
        enemy.x,
        enemy.y
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      this.sound.play("turret");
      const projectile = this.projectilesGroup.create(
        turret.x,
        turret.y,
        "projectile"
      );

      const angle = Phaser.Math.Angle.Between(
        turret.x,
        turret.y,
        closestEnemy.x,
        closestEnemy.y
      );

      const speed = 550;

      projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      projectile.damage = turret.damage;

      this.time.delayedCall(2000, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
    }
  }

  fireShotgun() {
    let closestEnemy = null;
    let closestDistance = Infinity;

    this.enemiesGroup.getChildren().forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      this.sound.play("shotgunshot");
      const projectileCount = 2 + this.playerStats.specials.shotgun * 3;
      const spreadAngle = Phaser.Math.DegToRad(10);

      for (let i = 0; i < projectileCount; i++) {
        const angleOffset = (i - Math.floor(projectileCount / 2)) * spreadAngle;
        const angle =
          Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            closestEnemy.x,
            closestEnemy.y
          ) + angleOffset;

        const projectile = this.projectilesGroup.create(
          this.player.x,
          this.player.y,
          "projectile"
        );

        const speed = 220;

        projectile.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );

        projectile.damage = this.playerStats.damage * 0.5;

        this.time.delayedCall(1500, () => {
          if (projectile.active) {
            projectile.destroy();
          }
        });
      }
    }
  }

  createUI() {
    this.uiGroup = this.add.group();

    this.healthText = this.add
      .text(
        16,
        16,
        `Health: ${this.player.health}/${this.playerStats.maxHealth}`,
        { fontSize: "18px", fill: "#fff" }
      )
      .setScrollFactor(0)
      .setDepth(10000);
    this.levelText = this.add
      .text(16, 40, `Level: ${this.playerStats.level}`, {
        fontSize: "18px",
        fill: "#fff",
      })
      .setScrollFactor(0)
      .setDepth(10000);
    this.experienceText = this.add
      .text(
        16,
        64,
        `Experience: ${this.playerStats.experience}/${
          this.playerStats.level * 25
        }`,
        { fontSize: "18px", fill: "#fff" }
      )
      .setScrollFactor(0)
      .setDepth(10000);
    this.skillPointsText = this.add
      .text(16, 88, `Skill Points: ${this.playerStats.skillPoints}`, {
        fontSize: "18px",
        fill: "#fff",
      })
      .setScrollFactor(0)
      .setDepth(10000);
    this.killsText = this.add
      .text(16, 112, `Kills: ${this.kills}`, {
        fontSize: "18px",
        fill: "#fff",
      })
      .setScrollFactor(0)
      .setDepth(10000);
    this.timeText = this.add
      .text(16, 136, `Time: 0`, { fontSize: "18px", fill: "#fff" })
      .setScrollFactor(0)
      .setDepth(10000);

    this.upgradeHintText = this.add
      .text(400, 520, "Press SPACE for upgrade menu", {
        fontSize: "18px",
        fill: "#ffff00",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(10000);

    this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(10000);

    this.expBar = this.add.graphics().setScrollFactor(0).setDepth(10000);

    this.uiGroup.add(this.healthText);
    this.uiGroup.add(this.levelText);
    this.uiGroup.add(this.experienceText);
    this.uiGroup.add(this.skillPointsText);
    this.uiGroup.add(this.killsText);
    this.uiGroup.add(this.timeText);
    this.uiGroup.add(this.upgradeHintText);
  }

  updateUI() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x333333);
    this.healthBar.fillRect(16, 550, 200, 20);
    this.healthBar.fillStyle(0xff0000);
    const healthWidth = Math.max(
      0,
      (this.player.health / this.playerStats.maxHealth) * 200
    );
    this.healthBar.fillRect(16, 550, healthWidth, 20);

    this.expBar.clear();
    this.expBar.fillStyle(0x333333);
    this.expBar.fillRect(16, 580, 200, 10);
    this.expBar.fillStyle(0x00ffff);
    const expWidth =
      (this.playerStats.experience / (this.playerStats.level * 25)) * 200;
    this.expBar.fillRect(16, 580, expWidth, 10);

    if (this.playerStats.skillPoints > 0) {
      const time = this.gameTime / 500;
      const alpha = 0.5 + Math.sin(time) * 0.5;
      this.upgradeHintText.setAlpha(alpha);
    } else {
      this.upgradeHintText.setAlpha(0.5);
    }
  }

  fireProjectile() {
    let closestEnemy = null;
    let closestDistance = Infinity;

    this.enemiesGroup.getChildren().forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        enemy.x,
        enemy.y
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      this.sound.play("shot");
      const projectile = this.projectilesGroup.create(
        this.player.x,
        this.player.y,
        "projectile"
      );

      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        closestEnemy.x,
        closestEnemy.y
      );

      const speed = 300;

      projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

      projectile.damage = this.playerStats.damage;

      this.time.delayedCall(2000, () => {
        if (projectile.active) {
          projectile.destroy();
        }
      });
    }
  }

  spawnEnemy(level) {
    const distance = 600;
    const angle = Math.random() * Math.PI * 2;
    const x = this.player.x + Math.cos(angle) * distance;
    const y = this.player.y + Math.sin(angle) * distance;

    const enemy = this.enemiesGroup.create(x, y, `enemy${level}`);
    enemy.level = level
    switch (level) {
      case 1:
        enemy.score = 1;
        enemy.isBoss = false;
        enemy.health = 20;
        enemy.maxHealth = enemy.health;
        enemy.speed = 100;
        enemy.damage = 10;
        enemy.expValue = 18;
        enemy.setScale(0.25);
        break;
      case 2:
        enemy.score = 5;
        enemy.isBoss = false;
        enemy.health = 15;
        enemy.maxHealth = enemy.health;
        enemy.speed = 180;
        enemy.damage = 25;
        enemy.expValue = 35;
        enemy.setScale(0.15);
        break;
      case 3:   
        enemy.score = 10;
        enemy.isBoss = false;
        enemy.health = 50;
        enemy.maxHealth = enemy.health;
        enemy.speed = 80;
        enemy.damage = 30;
        enemy.expValue = 90;
        enemy.setScale(0.5);
        break;
      case 4:
        enemy.score = 20;
        enemy.isBoss = false;
        enemy.health = 140;
        enemy.maxHealth = enemy.health;
        enemy.speed = 100;
        enemy.damage = 50;
        enemy.expValue = 300;
        enemy.setScale(0.7);
        break;
      case 5:
        enemy.score = 30;
        enemy.isBoss = false;
        enemy.health = 860;
        enemy.maxHealth = enemy.health;
        enemy.speed = 50;
        enemy.damage = 100;
        enemy.expValue = 550;
        enemy.setScale(1.1);
        break;
      case 6:
        enemy.score = 50;
        enemy.isBoss = false;
        enemy.health = 540;
        enemy.maxHealth = enemy.health;
        enemy.speed = 150;
        enemy.damage = 130;
        enemy.expValue = 450;
        enemy.setScale(0.7);
        break;
      case 7:
        enemy.score = 100;
        enemy.isBoss = false;
        enemy.health = 2100;
        enemy.maxHealth = enemy.health;
        enemy.speed = 30;
        enemy.damage = 200;
        enemy.expValue = 200;
        enemy.setScale(1.5);
        break;
      case 8:
        enemy.score = 250;
        enemy.isBoss = false;
        enemy.health = 7000;
        enemy.maxHealth = enemy.health;
        enemy.speed = 15;
        enemy.damage = 300;
        enemy.expValue = 0;
        enemy.setScale(2);
        break;
      case 9:
        enemy.score = 10000;
        enemy.isBoss = true;
        enemy.health = 250000;
        enemy.maxHealth = enemy.health;
        enemy.speed = 15;
        enemy.damage = 500;
        enemy.expValue = 1;
        enemy.setScale(3.5);
        break;
    }

    this.updateEnemyMovement(enemy);
  }

  updateEnemyMovement(enemy) {
    if (!enemy.active) return;
    if (this.blocked) {
      enemy.setVelocity(0, 0);
      return;
    }
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      this.player.x,
      this.player.y
    );

    enemy.setVelocity(
      Math.cos(angle) * enemy.speed,
      Math.sin(angle) * enemy.speed
    );

    this.time.delayedCall(300, () => {
      if (enemy.active) {
        this.updateEnemyMovement(enemy);
      }
    });
  }

  handlePlayerEnemyCollision(player, enemy) {
    if (player.isInvincible) return;
    player.isInvincible = true;
    player.health -= enemy.damage;
    player.tint = 0xff0000;
    this.healthText.setText(
      `Health: ${Math.max(0, player.health)}/${this.playerStats.maxHealth}`
    );
    this.hurtSound.play();
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );
    player.x += Math.cos(angle) * 25;
    player.y += Math.sin(angle) * 25;
    this.time.delayedCall(500, () => {
      player.isInvincible = false;
      player.clearTint();
    });
  }

  handleProjectileEnemyCollision(projectile, enemy) {
    if (projectile.hitEnemies === undefined) {
      projectile.hitEnemies = new Set();
    }

    if (projectile.hitEnemies.has(enemy)) {
      return;
    }

    enemy.health -= projectile.damage;

    projectile.hitEnemies.add(enemy);

    this.sound.play("hit");

    if (enemy.health <= 0) {

      this.score += enemy.score;
      this.enemiesKilled[enemy.level-1]+=1;
      
      if (enemy.isBoss && this.gamePhase == 2) this.gamePhase = 3;
      this.kills++;
      this.killsText.setText(`Kills: ${this.kills}`);

      this.spawnExperienceOrb(enemy.x, enemy.y, enemy.expValue);

      enemy.destroy();
    }

    const pierceLevel = this.playerStats.specials.pierce;

    if (pierceLevel > 0) {
      if (projectile.pierceCount === undefined) {
        projectile.pierceCount = 0;
      }

      projectile.pierceCount++;

      if (projectile.pierceCount <= pierceLevel) {
        return;
      }
    }

    projectile.destroy();
  }

  spawnExperienceOrb(x, y, value) {
    const orb = this.experienceOrbsGroup.create(x, y, "exp_orb");
    orb.expValue = value;
  }

  collectExperienceOrb(player, orb) {
    this.addExperience(orb.expValue);
    orb.destroy();
  }

  addExperience(value) {
    this.playerStats.experience += value;

    const experienceToNextLevel = this.playerStats.level * 25;

    while (this.playerStats.experience >= experienceToNextLevel) {
      this.playerStats.level++;
      this.playerStats.experience -= experienceToNextLevel;
      this.playerStats.skillPoints++;

      this.levelText.setText(`Level: ${this.playerStats.level}`);
      this.skillPointsText.setText(
        `Skill Points: ${this.playerStats.skillPoints}`
      );

      if (this.playerStats.skillPoints > 0) {
        this.upgradeHintText.setText(
          "Press SPACE for upgrade menu (skill points available!)"
        );
      }
    }

    this.experienceText.setText(
      `Experience: ${this.playerStats.experience}/${
        this.playerStats.level * 25
      }`
    );
  }

  continueGame(updatedStats) {
    this.playerStats = { ...updatedStats };
    this.player.health = this.playerStats.health;

    this.healthText.setText(
      `Health: ${this.player.health}/${this.playerStats.maxHealth}`
    );
    this.levelText.setText(`Level: ${this.playerStats.level}`);
    this.experienceText.setText(
      `Experience: ${this.playerStats.experience}/${
        this.playerStats.level * 25
      }`
    );
    this.skillPointsText.setText(
      `Skill Points: ${this.playerStats.skillPoints}`
    );

    if (this.playerStats.skillPoints === 0) {
      this.upgradeHintText.setText("Press SPACE for upgrade menu");
    }

    this.gamePaused = false;
    this.scene.resume();
  }

  handleGameOver() {
    if (this.gameOverScreen) return;

    this.bossBgSound.stop();
    this.bgSound.stop();
    this.hitSound.stop();
    this.turretSound.stop();
    this.sound.stopAll();
    this.finalSound.stop();

    this.gameOverScreen = true;

    const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const centerY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;

    const gameOverText = this.add
      .text(centerX, centerY - 50, "GAME OVER", {
        fontSize: "48px",
        fill: "#ff0000",
      })
      .setOrigin(0.5);

    const statsText = this.add
      .text(
        centerX,
        centerY + 30,
        `Level: ${this.playerStats.level}\nKills: ${
          this.kills
        }\nSurvival time: ${Math.floor(this.gameTime / 1000)} sec`,
        { fontSize: "24px", fill: "#ffffff", align: "center" }
      )
      .setOrigin(0.5);

    const restartButton = this.add
      .text(centerX, centerY + 120, "Main Menu", {
        fontSize: "32px",
        fill: "#00ff00",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.start("MainMenuScene");
      });

    const scoreText = this.add
      .text(centerX, centerY + 180, `Score: ${this.score}`, {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);
      
    this.gamePaused = true;
    this.physics.pause();

    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score, this.enemiesKilled.map(e => e));
    }
  }

  BossPhase() {
    if (this.gameTime > this.bossNextAttack) {
      let attack = Math.floor(Math.random() * 3);
      switch (attack) {
        case 0:
          this.boss1Sound.play();
          for (let i = 0; i < 100; i++) {
            this.spawnEnemy((i % 8) + 1);
          }
          break;
        case 1:
          this.boss2Sound.play();

          let speedchange = 250;
          if (this.playerStats.speed < 250) {
            speedchange = this.playerStats.speed-20;
          }
          let attackspeedchange = 6;
          if (this.playerStats.attackSpeed < 6) {
            attackspeedchange = this.playerStats.attackSpeed - 1;
          }

          this.playerStats.speed -= speedchange;
          this.playerStats.attackSpeed -= attackspeedchange;

          setTimeout(() => {
            this.playerStats.speed += speedchange;
            this.playerStats.attackSpeed += attackspeedchange;
          }, 6500);

          break;
        case 2:
          this.boss1Sound.play();
          for (let i = 0; i < 250; i++) {
            this.spawnEnemy(2);
          }
          break;
      }
      this.bossNextAttack = this.gameTime + 4000;
    }
  }
  
  StartEnd() {
    this.player.x = 800;
    this.player.y = 600;
    this.blocked = true;
    setInterval(() => {
      this.spawnEnemy(9);
    }, 200);
    setTimeout(() => {
      this.finalSound.volume = 1.5
      this.blocked = false;
    }, 15000);
  }
}
