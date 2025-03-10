import Phaser from "phaser";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  preload() {

    this.load.image("background", "/assets/bg.jpg");
    this.load.image("logo", "/assets/player.png"); 
  }

  create() {
    // Фон
    this.add.image(800, 600, "background");


    const title = this.add.text(
      this.cameras.main.width / 2,
      150,
      "SUCCANT",
      {
        fontSize: "64px",
        fontStyle: "bold",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      }
    ).setOrigin(0.5);


    const subtitle = this.add.text(
      this.cameras.main.width / 2,
      220,
      "Выживи как можно дольше!",
      {
        fontSize: "24px",
        fill: "#ffff00",
        stroke: "#000000",
        strokeThickness: 4,
      }
    ).setOrigin(0.5);


    const logo = this.add.image(
      this.cameras.main.width / 2,
      320,
      "logo"
    ).setScale(2).setTint(0x00ff00);


    this.tweens.add({
      targets: logo,
      y: 340,
      duration: 1500,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1
    });


    const startButton = this.add.text(
      this.cameras.main.width / 2,
      450,
      "START",
      {
        fontSize: "36px",
        fill: "#00ff00",
        backgroundColor: "#333333",
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      }
    ).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => startButton.setStyle({ fill: "#ffffff" }))
      .on("pointerout", () => startButton.setStyle({ fill: "#00ff00" }))
      .on("pointerdown", () => {

        this.scene.start("GameScene");
      });


    const howToPlayButton = this.add.text(
      this.cameras.main.width / 2,
      530,
      "HOW TO PLAY",
      {
        fontSize: "24px",
        fill: "#ffff00",
        backgroundColor: "#ff4400",
        padding: { left: 15, right: 15, top: 8, bottom: 8 }
      }
    ).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        howToPlayButton.setStyle({ backgroundColor: "#ff6622" });
        this.tweens.add({
          targets: howToPlayButton,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true
        });
      })
      .on("pointerout", () => howToPlayButton.setStyle({ backgroundColor: "#ff4400" }))
      .on("pointerdown", () => {
        this.showInstructions();
      });

    this.tweens.add({
      targets: howToPlayButton,
      alpha: 0.8,
      duration: 800,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });


    this.add.text(
      this.cameras.main.width - 10,
      this.cameras.main.height - 10,
      "v1.0.0",
      {
        fontSize: "16px",
        fill: "#aaaaaa"
      }
    ).setOrigin(1);
  }

  showInstructions() {

    const bg = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width - 100,
      this.cameras.main.height - 100,
      0x000000,
      0.8
    ).setInteractive();


    const title = this.add.text(
      this.cameras.main.width / 2,
      100,
      "HOW TO PLAY",
      {
        fontSize: "36px",
        fill: "#ffffff",
        fontStyle: "bold"
      }
    ).setOrigin(0.5);


    const instructions = this.add.text(
      this.cameras.main.width / 2,
      250,
      "• Use arrows to move\n" +
      "• Attack is automatic\n" +
      "• Collect experience from killed enemies\n" +
      "• Press SPACE to open upgrade menu\n" +
      "• Survive as long as possible!",
      {
        fontSize: "24px",
        fill: "#ffffff",
        align: "left"
      }
    ).setOrigin(0.5, 0);


    const closeButton = this.add.text(
      this.cameras.main.width / 2,
      450,
      "CLOSE",
      {
        fontSize: "28px",
        fill: "#00ff00",
        backgroundColor: "#333333",
        padding: { left: 15, right: 15, top: 8, bottom: 8 }
      }
    ).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => closeButton.setStyle({ fill: "#ffffff" }))
      .on("pointerout", () => closeButton.setStyle({ fill: "#00ff00" }))
      .on("pointerdown", () => {
        bg.destroy();
        title.destroy();
        instructions.destroy();
        closeButton.destroy();
      });
  }
}