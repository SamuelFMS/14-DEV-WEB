const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
let playerPosition = 50;
let previousTime = performance.now();
let wave = 0;
const keys = new Set();

const PLAYER_SPEED = 40; // % par seconde
const SHOT_COOLDOWN = 100;

const numberOfEnemiesPerRound = [5, 7, 10, 15, 20];

addEventListener("keydown", e => keys.add(e.key));
addEventListener("keyup", e => keys.delete(e.key));

function movePlayer(direction, deltaTime) {
    playerPosition += direction * PLAYER_SPEED * (deltaTime / 1000);

    playerPosition = Math.max(2.5, Math.min(97.5, playerPosition));

    player.style.left = `${playerPosition}%`;
}

function shoot(currentTime) {
    if (currentTime - lastShotTime < SHOT_COOLDOWN) return;

    spawnProjectile();
    lastShotTime = currentTime;
}

function shoot(){
    console.log("Tirer")
}

function startWave(){
    console.log("Starting wave " + wave);
    for (let i = 0; i < numberOfEnemiesPerRound[wave]; i++) {
        const enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.style.left = `${Math.random() * 90}%`;
        enemy.style.top = `${Math.random() * 40}%`;
        enemies.appendChild(enemy);
    }
}


function update(currentTime) {
    const deltaTime = currentTime - previousTime;
    previousTime = currentTime;
    if (keys.has("ArrowLeft")) {
        movePlayer(-1, deltaTime);
    }
    if (keys.has("ArrowRight")) {
        movePlayer(1, deltaTime);
    }
    if (keys.has("ArrowUp")) {
        shoot(currentTime);
    }
    if (enemies.childElementCount === 0) {
        wave++;
        startWave();
    }
    requestAnimationFrame(update);
}

function startGame() {
    startWave();
    requestAnimationFrame(update);
}

startGame();