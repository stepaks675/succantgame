import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { VerifierComponent } from "./sp1/Verifier.jsx";
import GameScene from "./scenes/GameScene.jsx";
import UpgradeScene from "./scenes/UpgradeScene";
import MainMenuScene from "./scenes/MainMenuScene";

function App() {
  const [score, setScore] = useState(0);
  const [enemiesKilled, setEnemiesKilled] = useState([0,0,0,0,0,0,0,0,0]);
  const [isProving, setIsProving] = useState(false);
  const [gotProved, setGotProved] = useState(false);
  const [proof, setProof] = useState(null);
  const gameRef = useRef(null);

  useEffect(() => {
    const gameScene = new GameScene((newScore, newEnemiesKilled) => {
      setScore(newScore);
      setEnemiesKilled([...newEnemiesKilled]);
    });

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
      scene: [MainMenuScene, UpgradeScene, gameScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);
  console.log(score, enemiesKilled);
  return (
    <div className=" flex flex-col justify-center items-center gap-5">
      <h1 className="text-white text-4xl font-bold">SUCCANT SURVIVORS</h1>
      <div className="border-2 border-white" id="game-container"></div>
      {score && <button className="bg-white text-black px-4 py-2 rounded-md" onClick={() => {
        fetch("http://localhost:3000/score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ total_score: score, enemy_kills: enemiesKilled }),
        }).then(res => res.json()).then(data => {
          setGotProved(true)
          setProof(data)
          console.log(data)
        })
      }}>Prove Score</button>}
      {gotProved && (
        <VerifierComponent
          a={
            proof.proof
          }
          b={proof.public_values}
          c={proof.vkey_hash}
        />
      )}
    </div>
  );
}

export default App;
