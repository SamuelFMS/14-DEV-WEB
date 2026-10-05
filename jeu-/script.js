function moveLeft(){
    console.log('Action pour la flèche GAUCHE');
}

function moveRight() {
    console.log('Action pour la flèche DROITE');
}

function shoot(){
    console.log("Tirer")
}



const keys = new Set();

addEventListener('keydown', e => keys.add(e.key));
addEventListener('keyup', e => keys.delete(e.key));

previousDeltaTime = performance.now()

function update() {
    new_time = performance.now()
    deltaTime = new_time -previousDeltaTime
    previousDeltaTime = new_time
    if (keys.has('ArrowLeft')) moveLeft();
    if (keys.has('ArrowRight')) moveRight();
    if (keys.has('ArrowUp')) shoot();
    
    requestAnimationFrame(update);
}

update();