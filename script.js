let board;
let scoreDisplay;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

document.getElementById("best").textContent = bestScore;

function updateBestscore() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
        document.getElementById("best").textContent = bestScore;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    board = document.getElementById('board');
    scoreDisplay = document.getElementById('score');
    createGrid();
    addRandomTile();
    addRandomTile();
});

document.getElementById("newGame").addEventListener("click", () => {
    const confirmReset = confirm("정말로 새 게임을 시작하시겠습니까?");
    if (!confirmReset) {
        return;
    }

    const tiles = document.querySelectorAll(".tile");
    tiles.forEach(tile => {
        tile.textContent = "";
        tile.setAttribute("data-value", "");
    });

    score = 0;
    scoreDisplay.textContent = "0";

    addRandomTile();
    addRandomTile();
});

function createGrid() {
    for (let i = 0; i < 16; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        board.appendChild(tile);
    }
}

function addRandomTile() {
    const emptyTiles = Array.from(document.querySelectorAll('.tile')).filter(tile => tile.textContent === "");

    if (emptyTiles.length === 0) {
        return;
    }

    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    const number = Math.random() < 0.9 ? 2 : 4;
    randomTile.textContent = number;
    randomTile.setAttribute("data-value", number);
}

document.addEventListener("keydown", keyInput);

function keyInput(event) {
    if (gameOver()) {
        return;
    }

    let moved = false;
    switch (event.key) {
        case "ArrowLeft":
            moved = moveTiles("left");
            break;
        case "ArrowRight":
            moved = moveTiles("right");
            break;
        case "ArrowUp":
            moved = moveTiles("up");
            break;
        case "ArrowDown":
            moved = moveTiles("down");
            break;
        default:
            return;
    }

    if (moved) {
        addRandomTile();
    }

    checkGameOver();
}

function moveTiles(direction) {
    const allTiles = Array.from(document.querySelectorAll('.tile'));
    let hasMovedOrMerged = false;

    for (let i = 0; i < 4; i++) {
        let lineTiles = [];
        let lineValues = [];

        if (direction === "left" || direction === "right") {
            lineTiles = allTiles.slice(i * 4, i * 4 + 4);
        } else {
            for (let j = 0; j < 4; j++) {
                lineTiles.push(allTiles[j * 4 + i]);
            }
        }

        lineValues = lineTiles.map(tile => tile.textContent === "" ? 0 : parseInt(tile.textContent));

        let originalLineValues = [...lineValues];

        let filteredValues = lineValues.filter(value => value !== 0);

        if (direction === "right" || direction === "down") {
            filteredValues.reverse();
        }

        for (let j = 0; j < filteredValues.length - 1; j++) {
            if (filteredValues[j] === filteredValues[j + 1]) {
                filteredValues[j] *= 2;
                score += filteredValues[j];
                scoreDisplay.textContent = score;
                updateBestscore();

                let tileToAnimate = lineTiles.find(t => parseInt(t.textContent) === filteredValues[j]);
                if (tileToAnimate) {
                    tileToAnimate.classList.add("merge");
                    setTimeout(() => tileToAnimate.classList.remove("merge"), 100);
                }

                filteredValues[j + 1] = 0;
            }
        }

        filteredValues = filteredValues.filter(value => value !== 0);
        while (filteredValues.length < 4) {
            if (direction === "left" || direction === "up") {
                filteredValues.push(0);
            } else {
                filteredValues.unshift(0);
            }
        }

        if (direction === "right" || direction === "down") {
            filteredValues.reverse();
        }

        for (let j = 0; j < 4; j++) {
            const tile = lineTiles[j];
            const newValue = filteredValues[j];
            if (parseInt(tile.textContent) !== newValue || (tile.textContent === "" && newValue !== 0)) {
                hasMovedOrMerged = true;
            }
            tile.textContent = newValue === 0 ? "" : newValue;
            tile.setAttribute("data-value", newValue === 0 ? "" : newValue);
        }
    }
    return hasMovedOrMerged;
}

function checkGameOver() {
    if (gameOver()) {
        setTimeout(() => {
            alert("Game Over!");
            updateBestscore();
        }, 200);
    }
}

function gameOver() {
    const tiles = Array.from(document.querySelectorAll(".tile")).map(t => t.textContent === "" ? 0 : parseInt(t.textContent));

    if (tiles.includes(0)) {
        return false;
    }

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            const index = row * 4 + col;
            if (tiles[index] === tiles[index + 1]) {
                return false;
            }
        }
    }

    for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 3; row++) {
            const index = row * 4 + col;
            if (tiles[index] === tiles[index + 4]) {
                return false;
            }
        }
    }

    return true;
}
