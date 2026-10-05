const player = document.getElementById("player");
let playerPosition = 50;
let previousDeltaTime = performance.now()

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



const keys = new Set();

addEventListener('keydown', e => keys.add(e.key));
addEventListener('keyup', e => keys.delete(e.key));



function update() {
    new_time = performance.now()
    deltaTime = new_time -previousDeltaTime
    previousDeltaTime = new_time
    if (keys.has('ArrowLeft')) moveLeft(deltaTime);
    if (keys.has('ArrowRight')) moveRight(deltaTime);
    if (keys.has('ArrowUp')) shoot();
    
    requestAnimationFrame(update);
}

update();