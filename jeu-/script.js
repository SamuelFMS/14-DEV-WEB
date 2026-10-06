const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
const playerProjectiles = document.getElementById("playerProjectiles");
const enemyProjectiles = document.getElementById("enemyProjectiles");

let playerPosition = 50;
let previousTime = performance.now();
let lastShotTime = 0;
let wave = 0;
let lastUpdateEnemyTime = performance.now();
let playerAlive = true;

const keys = new Set();

const PLAYER_SPEED = 40; // % par seconde
const SHOT_COOLDOWN = 400;
const ENEMY_ShOOT_COOLDOWN = 1000;
const PROJECTILE_SPEED = 50; // % par seconde

addEventListener("keydown", e => keys.add(e.key));
addEventListener("keyup", e => keys.delete(e.key));

/*
    Asteroids
*/
function spawnAsteroid() {
    const pos_x = Math.random() * 90 + 5; // Positions aléatoires entre 5% et 95%
    const asteroid = document.createElement("img");
    asteroid.classList.add("asteroid");
    asteroid.src = "images/Asteroid.png";
    asteroid.alt = "Asteroid";
    asteroid.style.left = `${pos_x}%`;
    asteroid.style.top = "0%";
    document.getElementById("asteroids").appendChild(asteroid);
}

function updateAsteroids(deltaTime) {
    const asteroids = Array.from(document.getElementsByClassName("asteroid"));
    for (const asteroid of asteroids) {
        const currentTop = parseFloat(asteroid.style.top);
        const newTop = currentTop + PROJECTILE_SPEED * (deltaTime / 1000);
        asteroid.style.top = `${newTop}%`;
        if (newTop > 150) {
            asteroid.remove();
        }
    }
}

function spawnAsteroidWave() {
    const asteroidCount = 150;
    for (let i = 0; i < asteroidCount; i++) {
        setTimeout(() => {
            spawnAsteroid();
        }, i * 300); // Espacement de 500ms entre chaque astéroïde
    }
}

/*
    Explosion
 */
function spawnExplosion(left, top) {
    const asteroid = document.createElement("img");
    asteroid.src = "images/Asteroid.png";
    asteroid.alt = "Asteroid";
    asteroid.style.position = "absolute";
    asteroid.style.left = `${left}`;
    asteroid.style.top = `${top}`;
    asteroid.style.width = "15vh";
    asteroid.style.height = "15vh";
    document.getElementById("asteroids").appendChild(asteroid);
    setTimeout(() => {
        asteroid.remove(); // Supprime le GIF après sa lecture
    }, 550);
}

/*
    Player Movement
*/
function movePlayer(direction, deltaTime) {
    playerPosition += direction * PLAYER_SPEED * (deltaTime / 1000);

    playerPosition = Math.max(2.5, Math.min(97.5, playerPosition));

    player.style.left = `${playerPosition}%`;
}

/*
    Enemy Movement
*/
function moveEnemies(deltaTime) {
    const time = performance.now() / 1000;

    for (const enemy of Array.from(enemies.children)) {
        const horizontalOffset = Math.sin(time * enemy.driftSpeed + enemy.driftOffset) * enemy.horizontalAmplitude;
        const verticalOffset = Math.sin(time * (enemy.driftSpeed * 1.8) + enemy.driftOffset) * enemy.verticalAmplitude;

        const nextLeft = Math.max(6, Math.min(94, enemy.baseX + horizontalOffset));
        const nextTop = Math.max(8, Math.min(28, enemy.baseY + verticalOffset));

        enemy.style.left = `${nextLeft}%`;
        enemy.style.top = `${nextTop}%`;
    }
}

/*
    Collisions
*/
function destroyPlayer() {
    if (!playerAlive) return;

    playerAlive = false;
    const playerRect = player.getBoundingClientRect();
    const explosionsRect = document.getElementById("explosions").getBoundingClientRect();
    const explosionLeft = `${playerRect.left + playerRect.width / 2 - explosionsRect.left}px`;
    const explosionTop = `${playerRect.top + playerRect.height / 2 - explosionsRect.top}px`;

    player.style.display = "none";
    spawnExplosion(explosionLeft, explosionTop);
}

function checkCollisionsEnemy() {
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
                if (enemies.children.length === 0) {
                    setTimeout(() => {
                        wave++;
                        startWave();
                    }, 1000);
                }
                spawnExplosion(explosionLeft, explosionTop);
            }
        }
    }

    if (!playerAlive) return;

    const playerRect = player.getBoundingClientRect();
    for (const projectile of Array.from(enemyProjectiles.children)) {
        const projectileRect = projectile.getBoundingClientRect();
        if (projectileRect.left < playerRect.right &&
            projectileRect.right > playerRect.left &&
            projectileRect.top < playerRect.bottom &&
            projectileRect.bottom > playerRect.top) {
            projectile.remove();
            destroyPlayer();
        }
    }
}

/*
    Projectiles
*/
// Joueur
function updateProjectiles(deltaTime) {
    const projectiles = Array.from(playerProjectiles.children);
    for (const projectile of projectiles) {
        const currentBottom = parseFloat(projectile.style.bottom);
        const newBottom = currentBottom + PROJECTILE_SPEED * (deltaTime / 1000);
        projectile.style.bottom = `${newBottom}%`;
        if (newBottom > 100) {
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

//Enemie
function spawnEnemyProjectile(enemy) {
    if(!document.body.contains(enemy) || playerAlive === false) return;


    const projectile = document.createElement("div");

    projectile.classList.add("projectile");

    // Le joueur et le projectile ont maintenant le même référentiel
    projectile.style.left = `${enemy.style.left}`;
    projectile.style.top = `${enemy.style.top}`;

    enemyProjectiles.appendChild(projectile);

    setTimeout(() => {
        spawnEnemyProjectile(enemy);
    }, ENEMY_ShOOT_COOLDOWN);
}

function updateEnemyProjectiles(deltaTime) {
    const projectiles = Array.from(enemyProjectiles.children);
    for (const projectile of projectiles) {
        const currentTop = parseFloat(projectile.style.top);
        const newTop = currentTop + PROJECTILE_SPEED * (deltaTime / 1000);
        projectile.style.top = `${newTop}%`;
        if(projectile.getBoundingClientRect().bottom > window.innerHeight) {
            /* remove dom element */
            projectile.remove();
        }
    }
}

/*
    Tir du joueur
*/
function shoot(currentTime) {
    if (currentTime - lastShotTime < SHOT_COOLDOWN) return;

    spawnProjectile();
    lastShotTime = currentTime;
}

/*
    Commencement des vagues d'ennemis
*/
function startWave() {
    wave = 1;
    if (wave >= 3) {
        console.log("Toutes les vagues terminées !");
        return;
    }
    console.log(`Starting wave ${wave + 1}`);
    switch (wave) {
        case 0:
            const enemyCount = 5;
            for (let i = 0; i < enemyCount; i++) {
                const enemy = document.createElement("div");
                enemy.classList.add("enemy");

                const baseX = 10 + (i / (enemyCount - 1)) * 80;
                const baseY = 10 + (i % 3) * 1.5;

                enemy.baseX = baseX;
                enemy.baseY = baseY;
                enemy.driftOffset = Math.random() * Math.PI * 2;
                enemy.driftSpeed = 1.2 + Math.random() * 1.3;
                enemy.horizontalAmplitude = 4 + Math.random() * 6;
                enemy.verticalAmplitude = 0.8 + Math.random() * 1.2;

                enemy.style.left = `${baseX}%`;
                enemy.style.top = `${baseY}%`;
                enemies.appendChild(enemy);

                const enemyImage = document.createElement("img");
                enemyImage.src = "images/Enemy.png";
                enemyImage.alt = "Ennemi";
                enemyImage.classList.add("enemyImage");
                enemy.appendChild(enemyImage);

                setTimeout(() => {
                    spawnEnemyProjectile(enemy);
                }, ENEMY_ShOOT_COOLDOWN);
            }
        case 1:
            spawnAsteroidWave();
        case 2:
            break;
        default:
            break;
    }

}

/*
    Update loop
*/
async function update(currentTime) {
    const deltaTime = currentTime - previousTime;
    previousTime = currentTime;
    if (!playerAlive) return;
    if (keys.has("ArrowLeft")) {
        movePlayer(-1, deltaTime);
    }
    if (keys.has("ArrowRight")) {
        movePlayer(1, deltaTime);
    }
    if (keys.has("ArrowUp")) {
        shoot(currentTime);
    }
    moveEnemies(deltaTime);
    updateProjectiles(deltaTime);
    updateEnemyProjectiles(deltaTime);
    updateAsteroids(deltaTime);
    checkCollisionsEnemy();  
    requestAnimationFrame(update);
}

/*
    Start the game
*/
function startGame() {
    startWave();
    requestAnimationFrame(update);
}

startGame();