const player = document.getElementById("player");
const enemies = document.getElementById("enemies");
let playerPosition = 50;
let previousDeltaTime = performance.now()
let wave = 0;
const keys = new Set();

addEventListener('keydown', e => keys.add(e.key));
addEventListener('keyup', e => keys.delete(e.key));


const numberOfEnemiesPerRound = [5, 7, 10, 15, 20];
function moveLeft(deltaTime){
    playerPosition -= 1*deltaTime/15;
    playerPosition = Math.max(3.5, playerPosition);
    player.style.left = `${playerPosition}%`;
}

function moveRight(deltaTime) {
    playerPosition += 1*deltaTime/15;
    playerPosition = Math.min(96.5, playerPosition);
    player.style.left = `${playerPosition}%`;
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


function update() {
    if(enemies.childElementCount === 0){
        console.log("Wave " + wave + " completed");
        wave++;
        startWave();
    }
    new_time = performance.now()
    deltaTime = new_time -previousDeltaTime
    previousDeltaTime = new_time
    if (keys.has('ArrowLeft')) moveLeft(deltaTime);
    if (keys.has('ArrowRight')) moveRight(deltaTime);
    if (keys.has('ArrowUp')) shoot();
    
    requestAnimationFrame(update);
}

function startGame() {
    startWave();
}

startGame();

update();
