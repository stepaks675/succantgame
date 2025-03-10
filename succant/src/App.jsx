import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "./scenes/GameScene.jsx";
import UpgradeScene from "./scenes/UpgradeScene";
import MainMenuScene from "./scenes/MainMenuScene";

function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: "game-container",
      width: 800,
      height: 600,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [MainMenuScene, GameScene, UpgradeScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <h1>SUCCANT SURVIVORS</h1>
      <div id="game-container"></div>
    </div>
  );
}

export default App;
