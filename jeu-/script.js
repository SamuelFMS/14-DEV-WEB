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
    Boss
*/
function rotateLaser() {
    const laser = document.querySelector(".laser");
    const boss = document.querySelector(".boss");
    const game = document.getElementById("game");

    if (!laser || !boss || !game) return;

    const gameRect = game.getBoundingClientRect();
    const bossRect = boss.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    const bossX = bossRect.left - gameRect.left + bossRect.width / 2;
    const bossY = bossRect.top - gameRect.top + bossRect.height / 2;
    const playerX = playerRect.left - gameRect.left + playerRect.width / 2;
    const playerY = playerRect.top - gameRect.top + playerRect.height / 2;

    const deltaX = playerX - bossX;
    const deltaY = playerY - bossY;
    const distance = Math.max(Math.hypot(deltaX, deltaY), 1);
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    laser.style.left = `${bossX}px`;
    laser.style.top = `${bossY}px`;
    laser.style.width = `${distance}px`;
    laser.style.height = "0.8vh";
    laser.style.transformOrigin = "0 50%";
    laser.style.transform = `rotate(${angle}deg)`;
    laser.style.opacity = "1";

    laser.directionX = deltaX / distance;
    laser.directionY = deltaY / distance;
}
function spawnLaser(boss) {
    console.log("Spawning laser");

    const laser = document.createElement("div");
    laser.classList.add("laser");
    console.log(enemyProjectiles.children.length)
    enemyProjectiles.appendChild(laser);
    console.log(enemyProjectiles.children.length)
    rotateLaser();
}
function spawnBoss() {
    const boss = document.createElement("div");
    boss.classList.add("boss");
    boss.style.left = "50%";
    boss.style.top = "5%";
    boss.health = 300;
    enemies.appendChild(boss);
    const bossImage = document.createElement("img");
    bossImage.src = "images/boss.png";
    bossImage.alt = "Boss";
    bossImage.classList.add("bossImage");
    boss.appendChild(bossImage);
    spawnLaser(bossImage)
    boss.hit = () => {
        console.log("boss got hit")
        boss.health -= 5;
        if (boss.health <= 0) {
            boss.remove();
        }
    }
    boss.update = () => moveBoss();
}

/*
    Asteroids
*/
function spawnAsteroid() {
    const pos_x = Math.random() * 90 + 5; // Positions aléatoires entre 5% et 95%
    const asteroid = document.createElement("div");
    asteroid.classList.add("asteroid");
    asteroid.style.left = `${pos_x}%`;
    asteroid.style.top = "0%";
    document.getElementById("asteroids").appendChild(asteroid);
    const asteroid_image = document.createElement("img");
    asteroid_image.src = "images/Asteroid.png";
    asteroid.alt = "Asteroid";
    asteroid.appendChild(asteroid_image);
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
        }, i * 300); // Espacement de 300ms entre chaque astéroïde
    }
    setTimeout(() => {
        wave++;
        startWave();
    }, 1000)
}

/*
    Explosion
 */
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
    setTimeout(() => {
        explosion.remove(); // Supprime le GIF après sa lecture
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
function moveEnemies(enemy) {
    const time = performance.now() / 1000;

    const horizontalOffset = Math.sin(time * enemy.driftSpeed + enemy.driftOffset) * enemy.horizontalAmplitude;
    const verticalOffset = Math.sin(time * (enemy.driftSpeed * 1.8) + enemy.driftOffset) * enemy.verticalAmplitude;

    const nextLeft = Math.max(6, Math.min(94, enemy.baseX + horizontalOffset));
    const nextTop = Math.max(8, Math.min(28, enemy.baseY + verticalOffset));

    enemy.style.left = `${nextLeft}%`;
    enemy.style.top = `${nextTop}%`;
}

/*
    Boss Movement
*/
function moveBoss(deltaTime) {
    getBoss = document.querySelector(".boss");
    if (!getBoss) return;
    const bossRect = getBoss.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    // Center positions
    const bossX = bossRect.left + bossRect.width / 2;
    const bossY = bossRect.top + bossRect.height / 2;

    const playerX = playerRect.left + playerRect.width / 2;
    const playerY = playerRect.top + playerRect.height / 2;

    // Direction boss -> player
    const deltaX = playerX - bossX;
    const deltaY = playerY - bossY;

    // Convert angle from radians to degrees
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

    getBoss.style.transform = `translate(-50%, +20%) rotate(${angle-90}deg)`

    rotateLaser();
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
                enemy.hit(); // Call the hit method on the enemy
                projectile.remove();
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
    for (const projectile of Array.from(document.querySelectorAll("#enemyProjectiles .projectile"))) {
        const projectileRect = projectile.getBoundingClientRect();
        if (projectileRect.left < playerRect.right &&
            projectileRect.right > playerRect.left &&
            projectileRect.top < playerRect.bottom &&
            projectileRect.bottom > playerRect.top) {
            projectile.remove();
            destroyPlayer();
        }
    }

    for (const asteroid of Array.from(document.getElementsByClassName("asteroid"))) {
        const asteroidRect = asteroid.getBoundingClientRect();
        if (asteroidRect.left < playerRect.right &&
            asteroidRect.right > playerRect.left &&
            asteroidRect.top < playerRect.bottom &&
            asteroidRect.bottom > playerRect.top) {
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
    const projectiles = Array.from(document.querySelectorAll("#enemyProjectiles .projectile"));
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

function createEnemy(i, enemyCount) {
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
    enemy.hit = () => {
        enemy.remove();
    }
    enemy.update = () => {
        moveEnemies(enemy);
    }
    setTimeout(() => {
        spawnEnemyProjectile(enemy);
    }, ENEMY_ShOOT_COOLDOWN);
}

/*
    Commencement des vagues d'ennemis
*/
function startWave() {
    wave = 2
    if (wave >= 3) {
        console.log("Toutes les vagues terminées !");
        return;
    }
    console.log(`Starting wave ${wave + 1}`);
    switch (wave) {
        case 0:
            const enemyCount = 5;
            for (let i = 0; i < enemyCount; i++) {
                createEnemy(i, enemyCount);
            }
            break;
        case 1:
            spawnAsteroidWave();
            break;
        case 2:
            spawnBoss();
            break;
        default:
            break;
    }

}

function updateAllEnenmies(deltaTime) {
    for (const enemy of Array.from(enemies.children)) {
        enemy.update(deltaTime)
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
    updateProjectiles(deltaTime);
    updateEnemyProjectiles(deltaTime);
    updateAllEnenmies(deltaTime)
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