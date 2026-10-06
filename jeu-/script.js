const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
const playerProjectiles = document.getElementById("playerProjectiles");

let playerPosition = 50;
let previousTime = performance.now();
let lastShotTime = 0;
let wave = 0;

const keys = new Set();

const PLAYER_SPEED = 40; // % par seconde
const SHOT_COOLDOWN = 400;

const numberOfEnemiesPerRound = [5, 7, 10, 15, 20];

addEventListener("keydown", e => keys.add(e.key));
addEventListener("keyup", e => keys.delete(e.key));

function spawnExplosion(left, top) {
    const explosion = document.createElement("img");
    explosion.src = "images/explosion.gif";
    explosion.alt = "Explosion";
    explosion.style.position = "absolute";
    explosion.style.left = `${left}`;
    explosion.style.top = `${top}`;
    explosion.style.width = "15vh";
    explosion.style.height = "15vh";
    document.getElementById("explosions").appendChild(explosion);
}

function movePlayer(direction, deltaTime) {
    playerPosition += direction * PLAYER_SPEED * (deltaTime / 1000);

    playerPosition = Math.max(2.5, Math.min(97.5, playerPosition));

    player.style.left = `${playerPosition}%`;
}

function checkCollisions() {
    for (const projectile of Array.from(playerProjectiles.children)) {
        const projectileRect = projectile.getBoundingClientRect();
        for (const enemy of Array.from(enemies.children)) {
            const enemyRect = enemy.getBoundingClientRect();
            if (projectileRect.left < enemyRect.right &&
                projectileRect.right > enemyRect.left &&
                projectileRect.top < enemyRect.bottom &&
                projectileRect.bottom > enemyRect.top) {
                console.log("Collision detected!");
                const explosionsRect = document.getElementById("explosions").getBoundingClientRect();
                const explosionLeft = `${enemyRect.left + enemyRect.width / 2 - explosionsRect.left}px`;
                const explosionTop = `${enemyRect.top + enemyRect.height / 2 - explosionsRect.top}px`;
                console.log(`Explosion at: left=${explosionLeft}, top=${explosionTop}`);
                projectile.remove();
                enemy.remove();
                spawnExplosion(explosionLeft, explosionTop);
            }
        }
    }
}

function updateProjectiles(deltaTime) {
    const projectiles = Array.from(playerProjectiles.children);
    for (const projectile of projectiles) {
        const currentBottom = parseFloat(projectile.style.bottom);
        const newBottom = currentBottom + 50 * (deltaTime / 10);
        projectile.style.bottom = `${newBottom}px`;
        if(projectile.getBoundingClientRect().top < 0) {
            /* remove dom element */
            console.log("Projectile removed");
            projectile.remove();
        }
    }
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
        enemy.style.left = `${10 + (i / (enemyCount - 1)) * 80}%`;
        enemy.style.top = `${5 + 0.5 * 35}%`;
        enemies.appendChild(enemy);
        const enemyImage = document.createElement("img");
        enemyImage.src = "images/Enemy.png";
        enemyImage.alt = "Ennemi";
        enemyImage.classList.add("enemyImage");
        enemy.appendChild(enemyImage);
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
    updateProjectiles(deltaTime);
    checkCollisions();  
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