const content = document.getElementById("content");
const earth = document.getElementById("earth");
const plane = document.getElementById("plane");
const playButton = document.getElementById("playButton");
const black = document.getElementById("black");

let gameStarting = false;

/* Asteroids */
function spawnAsteroid() {
    if (gameStarting) return;

    const asteroid = document.createElement("div");
    asteroid.classList.add("asteroid");

    const spawnFromLeft = Math.random() < 0.5;
    if (spawnFromLeft) {
        asteroid.style.left = "-10vw";
        asteroid.style.top = `${Math.random() * 80}vh`;
    } else {
        asteroid.style.left = `${Math.random() * 80}vw`;
        asteroid.style.top = "-10vh";
    }

    asteroid.style.width = `${2 + Math.random() * 5}vw`;
    asteroid.style.animationDuration = `${5 + Math.random() * 8}s`;
    content.appendChild(asteroid);
    asteroid.addEventListener("animationend", () => asteroid.remove(), { once: true });
}

const asteroidInterval = setInterval(spawnAsteroid, 2000);

/* Play button */
playButton.addEventListener("click", () => {
    if (gameStarting) return;
    gameStarting = true;

    playButton.classList.add("hidden");
    plane.classList.add("hidden");
    clearInterval(asteroidInterval);
    document.querySelectorAll(".asteroid").forEach(asteroid => asteroid.classList.add("hidden"));
    earth.classList.add("zoom");

    // Start fading to black after two seconds
    setTimeout(() => black.classList.add("visible"), 2000);

    // Redirect after the full three-second transition
    setTimeout(() => {
        window.location.href = "jeu/index.html";
    }, 3000);
});
