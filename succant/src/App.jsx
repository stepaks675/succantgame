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
            "11b6a09d2c97600399d69fa4c43ad2ad5d3d0c66c322abf36f0072f0c4331da05db7268f255c0a618e39f2d3e8a19545d008f5a81bc0454580514bec82a7f269b1acbc0f0e5b189bf523c2983231ca5bdf8cb01f826537f0c906e66054b3e2c21c2b73491ca46bd572b1254b1a12bbd9f4fd8003a6043fd9fc03d3289516fecb2fe26ee00768f8127427a7e1453d9ec482ee4fe0f257500497aeb802fb5595fbf825d6390161cee1529a49e652cf7387a74ac6cee625dd34c4a2e6c7321aca1b8010a20725fa4eb46c9ad74507cac2191c4e8b8b6be927a049d22f35327401d43d6caff61d095fcf2ad1208408da55e70678cd199b503e75cc3f0c8b4e37ee70f1638016"
          }
          b={"690000000000000001"}
          c={"0x00a10aeb968dddf88a30c44a3b130585833591fd35a3b0cd26e1843f3ecc5757"}
        />
      )}
    </div>
  );
}

export default App;
