const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
const playerProjectiles = document.getElementById("playerProjectiles");
const enemyProjectiles = document.getElementById("enemyProjectiles");
const asteroids = document.getElementById("asteroids");
const explosions = document.getElementById("explosions");
const game = document.getElementById("game");
const endMenu = document.getElementById("endMenu");
const endTitle = document.getElementById("endTitle");
const replayButton = document.getElementById("replayButton");

let playerPosition = 50;
let previousTime = performance.now();
let lastShotTime = 0;
let wave = 0;
let playerAlive = true;
let waveTransitionScheduled = false;

const keys = new Set();

const PLAYER_SPEED = 40; // % par seconde
const SHOT_COOLDOWN = 400;
const ENEMY_SHOOT_COOLDOWN = 1000;
const PROJECTILE_SPEED = 50; // % par seconde

/*
    Boss / Laser
*/
const BOSS_HEALTH = 300;
const LASER_AIM_TIME = 2000; // Temps pendant lequel le boss vise
const LASER_WARNING_TIME = 1000; // Temps de clignotement
const LASER_FIRE_TIME = 500; // Durée du tir
const LASER_COOLDOWN = 1000; // Pause avant le prochain laser
const LASER_HITBOX = 10;

/*
    Gestion du clavier
*/
addEventListener("keydown", (event) => {
    keys.add(event.key);
});

addEventListener("keyup", (event) => {
    keys.delete(event.key);
});

replayButton.addEventListener("click", () => {
    window.location.reload();
});

function showEndMenu(title) {
    endTitle.textContent = title;
    endMenu.hidden = false;
}

/*
    Explosion
*/
function spawnExplosion(left, top) {
    const explosion = document.createElement("img");

    explosion.src = "images/explosion.gif";
    explosion.alt = "Explosion";

    explosion.style.left = `${left}px`;
    explosion.style.top = `${top}px`;

    explosions.appendChild(explosion);

    setTimeout(() => {
        explosion.remove();
    }, 550);
}

/*
    Destruction du joueur
*/
function destroyPlayer() {
    if (!playerAlive) return;

    playerAlive = false;

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    const explosionX =
        playerRect.left -
        gameRect.left +
        playerRect.width / 2;

    const explosionY =
        playerRect.top -
        gameRect.top +
        playerRect.height / 2;

    player.style.display = "none";

    spawnExplosion(explosionX, explosionY);
    showEndMenu("Partie terminée");
}

/*
    Déplacement du joueur
*/
function movePlayer(direction, deltaTime) {
    playerPosition +=
        direction *
        PLAYER_SPEED *
        (deltaTime / 1000);

    playerPosition = Math.max(
        2.5,
        Math.min(97.5, playerPosition)
    );

    player.style.left = `${playerPosition}%`;
}

/*
    Tir du joueur
*/
function spawnProjectile() {
    const projectile = document.createElement("div");

    projectile.classList.add("projectile");

    projectile.style.left = `${playerPosition}%`;
    projectile.style.bottom = "7vh";

    playerProjectiles.appendChild(projectile);
}

function shoot(currentTime) {
    if (
        currentTime - lastShotTime <
        SHOT_COOLDOWN
    ) {
        return;
    }

    spawnProjectile();

    lastShotTime = currentTime;
}

/*
    Mise à jour des projectiles du joueur
*/
function updateProjectiles(deltaTime) {
    const projectiles =
        Array.from(playerProjectiles.children);

    for (const projectile of projectiles) {
        const currentBottom =
            parseFloat(projectile.style.bottom);

        const newBottom =
            currentBottom +
            PROJECTILE_SPEED *
            (deltaTime / 1000);

        projectile.style.bottom =
            `${newBottom}%`;

        if (newBottom > 110) {
            projectile.remove();
        }
    }
}

/*
    Création d'un ennemi
*/
function createEnemy(i, enemyCount) {
    const enemy = document.createElement("div");

    enemy.classList.add("enemy");

    const baseX =
        enemyCount === 1
            ? 50
            : 10 +
              (i / (enemyCount - 1)) * 80;

    const baseY =
        10 + (i % 3) * 1.5;

    enemy.baseX = baseX;
    enemy.baseY = baseY;

    enemy.driftOffset =
        Math.random() * Math.PI * 2;

    enemy.driftSpeed =
        1.2 + Math.random() * 1.3;

    enemy.horizontalAmplitude =
        4 + Math.random() * 6;

    enemy.verticalAmplitude =
        0.8 + Math.random() * 1.2;

    enemy.style.left = `${baseX}%`;
    enemy.style.top = `${baseY}%`;

    enemies.appendChild(enemy);

    const enemyImage =
        document.createElement("img");

    enemyImage.src = "images/Enemy.png";
    enemyImage.alt = "Ennemi";
    enemyImage.classList.add("enemyImage");

    enemy.appendChild(enemyImage);

    enemy.hit = () => {
        enemy.remove();
    };

    enemy.update = () => {
        moveEnemy(enemy);
    };

    setTimeout(() => {
        spawnEnemyProjectile(enemy);
    }, ENEMY_SHOOT_COOLDOWN);
}

/*
    Déplacement d'un ennemi
*/
function moveEnemy(enemy) {
    const time =
        performance.now() / 1000;

    const horizontalOffset =
        Math.sin(
            time * enemy.driftSpeed +
            enemy.driftOffset
        ) * enemy.horizontalAmplitude;

    const verticalOffset =
        Math.sin(
            time *
            (enemy.driftSpeed * 1.8) +
            enemy.driftOffset
        ) * enemy.verticalAmplitude;

    const nextLeft = Math.max(
        6,
        Math.min(
            94,
            enemy.baseX +
            horizontalOffset
        )
    );

    const nextTop = Math.max(
        8,
        Math.min(
            28,
            enemy.baseY +
            verticalOffset
        )
    );

    enemy.style.left = `${nextLeft}%`;
    enemy.style.top = `${nextTop}%`;
}

/*
    Tir des ennemis
*/
function spawnEnemyProjectile(enemy) {
    if (
        !document.body.contains(enemy) ||
        !playerAlive
    ) {
        return;
    }

    const enemyRect =
        enemy.getBoundingClientRect();

    const gameRect =
        game.getBoundingClientRect();

    const projectile =
        document.createElement("div");

    projectile.classList.add("projectile");

    const x =
        enemyRect.left -
        gameRect.left +
        enemyRect.width / 2;

    const y =
        enemyRect.top -
        gameRect.top +
        enemyRect.height;

    projectile.style.left = `${x}px`;
    projectile.style.top = `${y}px`;

    enemyProjectiles.appendChild(projectile);

    setTimeout(() => {
        spawnEnemyProjectile(enemy);
    }, ENEMY_SHOOT_COOLDOWN);
}

/*
    Mise à jour des projectiles ennemis
*/
function updateEnemyProjectiles(deltaTime) {
    const projectiles =
        Array.from(
            enemyProjectiles.querySelectorAll(
                ".projectile"
            )
        );

    for (const projectile of projectiles) {
        const currentTop =
            parseFloat(projectile.style.top);

        const speed =
            game.clientHeight *
            (PROJECTILE_SPEED / 100);

        const newTop =
            currentTop +
            speed *
            (deltaTime / 1000);

        projectile.style.top =
            `${newTop}px`;

        if (newTop > game.clientHeight) {
            projectile.remove();
        }
    }
}

/*
    Mise à jour de tous les ennemis
*/
function updateAllEnemies(deltaTime) {
    for (
        const enemy of
        Array.from(enemies.children)
    ) {
        if (
            typeof enemy.update ===
            "function"
        ) {
            enemy.update(deltaTime);
        }
    }
}

/*
    Astéroïdes
*/
function spawnAsteroid() {
    const asteroid =
        document.createElement("div");

    asteroid.classList.add("asteroid");

    const positionX =
        Math.random() * 90 + 5;

    asteroid.style.left =
        `${positionX}%`;

    asteroid.style.top = "0%";

    asteroids.appendChild(asteroid);

    const asteroidImage =
        document.createElement("img");

    asteroidImage.src =
        "images/Asteroid.png";

    asteroidImage.alt = "Asteroid";

    asteroid.appendChild(
        asteroidImage
    );
}

function updateAsteroids(deltaTime) {
    const asteroidList =
        Array.from(
            document.getElementsByClassName(
                "asteroid"
            )
        );

    for (const asteroid of asteroidList) {
        const currentTop =
            parseFloat(
                asteroid.style.top
            );

        const newTop =
            currentTop +
            PROJECTILE_SPEED *
            (deltaTime / 1000);

        asteroid.style.top =
            `${newTop}%`;

        if (newTop > 150) {
            asteroid.remove();
        }
    }
}

function spawnAsteroidWave() {
    const asteroidCount = 150;

    for (
        let i = 0;
        i < asteroidCount;
        i++
    ) {
        setTimeout(() => {
            spawnAsteroid();
        }, i * 300);
    }

    setTimeout(() => {
        wave++;
        startWave();
    }, asteroidCount * 300 + 1000);
}

/*
    ========================================
                BOSS
    ========================================
*/

function spawnBoss() {
    const boss =
        document.createElement("div");

    boss.classList.add("boss");

    boss.style.left = "50%";
    boss.style.top = "5%";

    boss.health = BOSS_HEALTH;

    boss.laserPhase = "aiming";
    boss.laserAngle = 0;
    boss.laserCycleStart =
        performance.now();

    enemies.appendChild(boss);

    const bossImage =
        document.createElement("img");

    bossImage.src =
        "images/boss.png";

    bossImage.alt = "Boss";

    bossImage.classList.add(
        "bossImage"
    );

    boss.appendChild(bossImage);

    /*
        On crée le laser APRÈS avoir
        ajouté le boss dans le DOM
    */
    spawnLaser(boss);

    boss.hit = () => {
        boss.health -= 5;

        console.log(
            "Boss HP :",
            boss.health
        );

        if (boss.health <= 0) {
            const bossRect =
                boss.getBoundingClientRect();

            const gameRect =
                game.getBoundingClientRect();

            const x =
                bossRect.left -
                gameRect.left +
                bossRect.width / 2;

            const y =
                bossRect.top -
                gameRect.top +
                bossRect.height / 2;

            spawnExplosion(x, y);

            if (boss.laser) {
                boss.laser.remove();
            }

            boss.remove();
            showEndMenu("Victoire !");
        }
    };

    boss.update = (deltaTime) => {
        moveBoss(boss, deltaTime);
    };
}

/*
    Rotation du boss vers le joueur
*/
function moveBoss(boss) {
    /*
        Pendant l'avertissement et le tir,
        le boss ne bouge plus.
    */
    if (
        boss.laserPhase === "warning" ||
        boss.laserPhase === "firing"
    ) {
        return;
    }

    const bossRect =
        boss.getBoundingClientRect();

    const playerRect =
        player.getBoundingClientRect();

    const bossX =
        bossRect.left +
        bossRect.width / 2;

    const bossY =
        bossRect.top +
        bossRect.height / 2;

    const playerX =
        playerRect.left +
        playerRect.width / 2;

    const playerY =
        playerRect.top +
        playerRect.height / 2;

    const deltaX =
        playerX - bossX;

    const deltaY =
        playerY - bossY;

    const angle =
        Math.atan2(
            deltaY,
            deltaX
        ) *
        180 /
        Math.PI;

    boss.style.transform =
        `translate(-50%, 20%) rotate(${angle - 90}deg)`;
}

/*
    ========================================
                LASER
    ========================================
*/

/*
    Création du laser
*/
function spawnLaser(boss) {
    const laser =
        document.createElement("div");

    laser.classList.add("laser");

    /*
        IMPORTANT :
        le laser est dans #enemyProjectiles,
        qui utilise le même référentiel que #game.
    */
    enemyProjectiles.appendChild(laser);

    boss.laser = laser;
}

/*
    Récupère le centre du boss
    dans les coordonnées du jeu
*/
function getBossCenter(boss) {
    const bossRect =
        boss.getBoundingClientRect();

    const gameRect =
        game.getBoundingClientRect();

    return {
        x:
            bossRect.left -
            gameRect.left +
            bossRect.width / 2,

        y:
            bossRect.top -
            gameRect.top +
            bossRect.height / 2
    };
}

/*
    Récupère le centre du joueur
    dans les coordonnées du jeu
*/
function getPlayerCenter() {
    const playerRect =
        player.getBoundingClientRect();

    const gameRect =
        game.getBoundingClientRect();

    return {
        x:
            playerRect.left -
            gameRect.left +
            playerRect.width / 2,

        y:
            playerRect.top -
            gameRect.top +
            playerRect.height / 2
    };
}

/*
    Calcule l'angle entre le boss
    et le joueur
*/
function getLaserAngle(boss) {
    const bossCenter =
        getBossCenter(boss);

    const playerCenter =
        getPlayerCenter();

    const dx =
        playerCenter.x -
        bossCenter.x;

    const dy =
        playerCenter.y -
        bossCenter.y;

    return Math.atan2(dy, dx);
}

/*
    Calcule la longueur nécessaire
    pour que le laser traverse
    complètement le plateau.
*/
function getLaserLength() {
    return Math.hypot(
        game.clientWidth,
        game.clientHeight
    ) * 1.5;
}

/*
    Positionne graphiquement le laser
*/
function drawLaser(boss) {
    if (!boss.laser) return;

    const laser = boss.laser;

    const center =
        getBossCenter(boss);

    const length =
        getLaserLength();

    laser.style.left =
        `${center.x}px`;

    laser.style.top =
        `${center.y}px`;

    laser.style.width =
        `${length}px`;

    laser.style.height = "1vh";

    laser.style.transform =
        `translateY(-50%) rotate(${boss.laserAngle}rad)`;
}

/*
    Cycle complet du laser :

    1. AIMING
       Le boss suit le joueur.
       Laser invisible.

    2. WARNING
       Direction verrouillée.
       Laser clignotant.

    3. FIRING
       Gros laser.
       Le joueur peut mourir.

    4. COOLDOWN
       Pause avant de recommencer.
*/
function updateBossLaser(currentTime) {
    const boss =
        document.querySelector(".boss");

    if (
        !boss ||
        !boss.laser ||
        !playerAlive
    ) {
        return;
    }

    const laser = boss.laser;

    const elapsed =
        currentTime -
        boss.laserCycleStart;

    /*
        PHASE 1 : VISÉE
    */
    if (
        elapsed <
        LASER_AIM_TIME
    ) {
        boss.laserPhase =
            "aiming";

        /*
            Tant qu'on vise,
            l'angle suit le joueur.
        */
        boss.laserAngle =
            getLaserAngle(boss);

        laser.style.opacity = "0";

        drawLaser(boss);

        return;
    }

    /*
        PHASE 2 : AVERTISSEMENT
    */
    if (
        elapsed <
        LASER_AIM_TIME +
        LASER_WARNING_TIME
    ) {
        /*
            On arrive JUSTE dans
            la phase warning.
        */
        if (
            boss.laserPhase !==
            "warning"
        ) {
            boss.laserPhase =
                "warning";

            /*
                On verrouille l'angle.

                Après cette ligne,
                on ne recalcule PLUS
                l'angle vers le joueur.
            */
            boss.laserAngle =
                getLaserAngle(boss);
        }

        const warningTime =
            elapsed -
            LASER_AIM_TIME;

        /*
            Clignotement toutes
            les 120 ms
        */
        const visible =
            Math.floor(
                warningTime / 120
            ) %
                2 ===
            0;

        laser.style.opacity =
            visible ? "0.8" : "0.15";

        laser.style.height =
            "0.5vh";

        drawLaser(boss);

        return;
    }

    /*
        PHASE 3 : TIR
    */
    if (
        elapsed <
        LASER_AIM_TIME +
        LASER_WARNING_TIME +
        LASER_FIRE_TIME
    ) {
        boss.laserPhase =
            "firing";

        laser.style.opacity = "1";

        laser.style.height =
            "1.5vh";

        /*
            IMPORTANT :
            boss.laserAngle n'est
            PAS recalculé ici.
        */
        drawLaser(boss);

        return;
    }

    /*
        PHASE 4 : COOLDOWN
    */
    if (
        elapsed <
        LASER_AIM_TIME +
        LASER_WARNING_TIME +
        LASER_FIRE_TIME +
        LASER_COOLDOWN
    ) {
        boss.laserPhase =
            "cooldown";

        laser.style.opacity = "0";

        return;
    }

    /*
        Nouveau cycle
    */
    boss.laserCycleStart =
        currentTime;

    boss.laserPhase =
        "aiming";

    laser.style.opacity = "0";
}

/*
    Collision entre le laser
    et le joueur
*/
function isLaserHittingPlayer() {
    const boss =
        document.querySelector(".boss");

    if (
        !boss ||
        !boss.laser ||
        boss.laserPhase !==
            "firing"
    ) {
        return false;
    }

    const bossCenter =
        getBossCenter(boss);

    const playerCenter =
        getPlayerCenter();

    /*
        Vecteur boss -> joueur
    */
    const dx =
        playerCenter.x -
        bossCenter.x;

    const dy =
        playerCenter.y -
        bossCenter.y;

    /*
        Vecteur normalisé représentant
        la direction du laser
    */
    const directionX =
        Math.cos(
            boss.laserAngle
        );

    const directionY =
        Math.sin(
            boss.laserAngle
        );

    /*
        Projection du joueur
        sur la direction du laser.
    */
    const projection =
        dx * directionX +
        dy * directionY;

    /*
        Si projection < 0,
        le joueur est derrière
        le boss.
    */
    if (projection < 0) {
        return false;
    }

    /*
        Distance perpendiculaire
        entre le centre du joueur
        et la ligne du laser.
    */
    const distance =
        Math.abs(
            dx * directionY -
            dy * directionX
        );

    const playerRect =
        player.getBoundingClientRect();

    /*
        On prend une hitbox adaptée
        à la taille du joueur.
    */
    const playerRadius =
        Math.min(
            playerRect.width,
            playerRect.height
        ) / 2;

    return (
        distance <
        playerRadius +
            LASER_HITBOX
    );
}

/*
    ========================================
              COLLISIONS
    ========================================
*/

function checkCollisions() {
    /*
        Projectiles joueur
        contre ennemis / boss
    */
    for (
        const projectile of
        Array.from(
            playerProjectiles.children
        )
    ) {
        const projectileRect =
            projectile.getBoundingClientRect();

        for (
            const enemy of
            Array.from(enemies.children)
        ) {
            const enemyRect =
                enemy.getBoundingClientRect();

            const collision =
                projectileRect.left <
                    enemyRect.right &&
                projectileRect.right >
                    enemyRect.left &&
                projectileRect.top <
                    enemyRect.bottom &&
                projectileRect.bottom >
                    enemyRect.top;

            if (!collision) {
                continue;
            }

            const gameRect =
                game.getBoundingClientRect();

            const explosionX =
                enemyRect.left -
                gameRect.left +
                enemyRect.width / 2;

            const explosionY =
                enemyRect.top -
                gameRect.top +
                enemyRect.height / 2;

            if (
                typeof enemy.hit ===
                "function"
            ) {
                enemy.hit();
            }

            projectile.remove();

            spawnExplosion(
                explosionX,
                explosionY
            );

            /*
                Un projectile ne peut
                toucher qu'un ennemi.
            */
            break;
        }
    }

    if (!playerAlive) return;

    const playerRect =
        player.getBoundingClientRect();

    /*
        Projectiles ennemis
        contre joueur
    */
    for (
        const projectile of
        Array.from(
            enemyProjectiles.querySelectorAll(
                ".projectile"
            )
        )
    ) {
        const projectileRect =
            projectile.getBoundingClientRect();

        const collision =
            projectileRect.left <
                playerRect.right &&
            projectileRect.right >
                playerRect.left &&
            projectileRect.top <
                playerRect.bottom &&
            projectileRect.bottom >
                playerRect.top;

        if (collision) {
            projectile.remove();

            destroyPlayer();

            return;
        }
    }

    /*
        Laser contre joueur
    */
    if (isLaserHittingPlayer()) {
        destroyPlayer();

        return;
    }

    /*
        Astéroïdes contre joueur
    */
    for (
        const asteroid of
        Array.from(
            asteroids.children
        )
    ) {
        const asteroidRect =
            asteroid.getBoundingClientRect();

        const collision =
            asteroidRect.left <
                playerRect.right &&
            asteroidRect.right >
                playerRect.left &&
            asteroidRect.top <
                playerRect.bottom &&
            asteroidRect.bottom >
                playerRect.top;

        if (collision) {
            destroyPlayer();

            return;
        }
    }

    /*
        Passage à la vague suivante.

        On ne le fait pas pendant
        la vague d'astéroïdes.
    */
    if (
        enemies.children.length === 0 &&
        wave !== 1 &&
        wave < 2 &&
        !waveTransitionScheduled
    ) {
        waveTransitionScheduled = true;

        setTimeout(() => {
            wave++;

            waveTransitionScheduled =
                false;

            startWave();
        }, 1000);
    }
}

/*
    ========================================
                VAGUES
    ========================================
*/

function startWave() {
    game.classList.toggle("starfall-active", wave === 1);

    console.log(
        `Starting wave ${wave + 1}`
    );

    switch (wave) {
        /*
            Vague 1 :
            ennemis classiques
        */
        case 0: {
            const enemyCount = 5;

            for (
                let i = 0;
                i < enemyCount;
                i++
            ) {
                createEnemy(
                    i,
                    enemyCount
                );
            }

            break;
        }

        /*
            Vague 2 :
            astéroïdes
        */
        case 1: {
            spawnAsteroidWave();

            break;
        }

        /*
            Vague 3 :
            boss
        */
        case 2: {
            spawnBoss();

            break;
        }

        default: {
            console.log(
                "Toutes les vagues sont terminées !"
            );

            break;
        }
    }
}

/*
    ========================================
              BOUCLE DU JEU
    ========================================
*/

function update(currentTime) {
    const deltaTime =
        currentTime -
        previousTime;

    previousTime =
        currentTime;

    /*
        On continue requestAnimationFrame
        même si le joueur est mort.
    */
    if (playerAlive) {
        /*
            Déplacement joueur
        */
        if (
            keys.has("ArrowLeft")
        ) {
            movePlayer(
                -1,
                deltaTime
            );
        }

        if (
            keys.has("ArrowRight")
        ) {
            movePlayer(
                1,
                deltaTime
            );
        }

        /*
            Tir joueur
        */
        if (
            keys.has("ArrowUp")
        ) {
            shoot(currentTime);
        }

        /*
            Mise à jour du jeu
        */
        updateProjectiles(
            deltaTime
        );

        updateEnemyProjectiles(
            deltaTime
        );

        updateAllEnemies(
            deltaTime
        );

        updateBossLaser(
            currentTime
        );

        updateAsteroids(
            deltaTime
        );

        checkCollisions();
    }

    requestAnimationFrame(update);
}

/*
    ========================================
              DÉMARRAGE
    ========================================
*/

function startGame() {
    startWave();

    requestAnimationFrame(
        update
    );
}

startGame();