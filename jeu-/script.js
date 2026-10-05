const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
const playerProjectiles = document.getElementById("playerProjectiles");

let playerPosition = 50;
let previousTime = performance.now();
let lastShotTime = 0;
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

function spawnProjectile() {
    const projectile = document.createElement("div");

    projectile.classList.add("projectile");

    // Le joueur et le projectile ont maintenant le même référentiel
    projectile.style.left = `${playerPosition}%`;
    projectile.style.bottom = "7vh";

    playerProjectiles.appendChild(projectile);
}

function shoot(currentTime) {
    if (currentTime - lastShotTime < SHOT_COOLDOWN) return;

    spawnProjectile();
    lastShotTime = currentTime;
}

function startWave() {
    if (wave >= numberOfEnemiesPerRound.length) {
        console.log("Toutes les vagues terminées !");
        return;
    }
    console.log(`Starting wave ${wave + 1}`);
    const enemyCount = numberOfEnemiesPerRound[wave];
    for (let i = 0; i < enemyCount; i++) {
        const enemy = document.createElement("div");
        enemy.classList.add("enemy");
        enemy.style.left = `${5 + Math.random() * 90}%`;
        enemy.style.top = `${5 + Math.random() * 35}%`;
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