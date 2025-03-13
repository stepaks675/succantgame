use sp1_sdk::{include_elf, ProverClient, SP1Stdin, HashableKey};
use axum::{
    routing::{post},
    Router,
    Json,
};
use tower_http::cors::{CorsLayer, Any};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;

const ELF: &[u8] = include_elf!("score");

#[derive(Serialize, Deserialize)]
struct GameData {
    total_score: u64,
    enemy_kills: [u64; 9],
}

#[derive(Debug, Serialize)]
struct ProofData {
    proof: String,
    public_inputs: String,
    vkey_hash: String,
}

async fn scoreproof(Json(mut game_data): Json<GameData>) -> Json<ProofData>{

	let mut stdin = SP1Stdin::new();
    stdin.write(&game_data);

    let client = ProverClient::from_env();

    let (pk, vk) = client.setup(ELF);
    let proof = client.prove(&pk, &stdin).groth16().run().expect("proof generation failed");

    println!("generated proof");
	
    let fixture = ProofData {
        proof: hex::encode(proof.bytes()),
        public_inputs: hex::encode(proof.public_values),
        vkey_hash: vk.bytes32(),
    };
	
	 println!("Successfully generated json proof for the program!");

    Json(fixture)
}

#[tokio::main]
async fn main() {
	let cors = CorsLayer::new()
    .allow_origin(Any)
    .allow_methods(Any)
    .allow_headers(Any);
    let app = Router::new()         
        .route("/score", post(scoreproof)) 
		.layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Сервер запущен на {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}