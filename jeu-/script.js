const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
const playerProjectiles = document.getElementById("playerProjectiles");
const enemyProjectiles = document.getElementById("enemyProjectiles");

let playerPosition = 50;
let previousTime = performance.now();
let lastShotTime = 0;
let wave = 0;
let waveWaiting = false;
let lastUpdateEnemyTime = performance.now();

const keys = new Set();

const PLAYER_SPEED = 40; // % par seconde
const SHOT_COOLDOWN = 400;
const ENEMY_ShOOT_COOLDOWN = 1000;
const PROJECTILE_SPEED = 50; // % par seconde
const numberOfEnemiesPerRound = [5, 7, 10, 15, 20];

addEventListener("keydown", e => keys.add(e.key));
addEventListener("keyup", e => keys.delete(e.key));


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
    if(!document.body.contains(enemy)) return;


    const projectile = document.createElement("div");

    projectile.classList.add("projectile");

    // Le joueur et le projectile ont maintenant le même référentiel
    console.log("Enemy shooting ", enemy.style.top);
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
            console.log("Enemy Projectile removed");
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
    if (wave >= numberOfEnemiesPerRound.length) {
        console.log("Toutes les vagues terminées !");
        return;
    }
    console.log(`Starting wave ${wave + 1}`);
    const enemyCount = numberOfEnemiesPerRound[wave];
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
}

/*
    Update loop
*/
async function update(currentTime) {
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
    moveEnemies(deltaTime);
    updateProjectiles(deltaTime);
    updateEnemyProjectiles(deltaTime);
    checkCollisions();  
    if (enemies.childElementCount === 0 && !waveWaiting) {
        waveWaiting = true;
        setTimeout(() => {
            wave++;
            startWave();
            waveWaiting = false;
        }, 1000);
    }
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