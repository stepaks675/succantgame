#![no_main]
sp1_zkvm::entrypoint!(main);
use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize)]
struct GameData {
    total_score: u64,
    enemy_kills: [u64; 9],
}

const ENEMY_COEFFICIENTS: [u64; 9] = [1, 5, 10, 20, 30, 50, 100, 250, 1000];

pub fn main() {

    let game_data = sp1_zkvm::io::read::<GameData>();

    let mut calculated_score: u64 = 0;
    
    for i in 0..9 {
        calculated_score += game_data.enemy_kills[i] * ENEMY_COEFFICIENTS[i];
    }

    let is_valid = game_data.total_score == calculated_score;
   
	sp1_zkvm::io::commit(&game_data.total_score);
    sp1_zkvm::io::commit(&is_valid);
}