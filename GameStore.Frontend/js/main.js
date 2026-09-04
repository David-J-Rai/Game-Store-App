class Game {
    constructor(id, name, genre, price, releaseDate) {
        this.id = id;
        this.name = name;
        this.genre = genre;
        this.price = price;
        this.releaseDate = releaseDate;
    }
}

class Genre {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

async function loadGamesTable() {
    const apiUrl = "http://localhost:5000/games";
    const gamesList = [];

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.log(`HTTP error: ${response.status}`);
            return;
        }

        const games = await response.json();

        games.forEach(game => {
            gamesList.push(new Game(game.id, game.name, game.genre, game.price, game.releaseDate));
        });
    } catch (error) {
        console.error('An error occurred during execution:', error)
    }

    return gamesList;
}

async function loadGenresTable() {
    const apiUrl = "http://localhost:5000/genres";
    const genresList = [];

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.log(`HTTP error: ${response.status}`);
            return;
        }

        const genres = await response.json();

        genres.forEach(genre => {
            genresList.push(new Genre(genre.id, genre.name));
        });
    } catch (error) {
        console.error('An error occurred during execution:', error)
    }

    return genresList;
}

function getRandomItems(arr, count) {
    const shuffled = [...arr]; 

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
}

document.addEventListener("DOMContentLoaded", async () => {
    if(window.location.href.includes("index")) {
        gamesList = getRandomItems(await loadGamesTable(), 5);

        document.getElementById("featured1").innerHTML = `
            <img src="./images/${gamesList[0].name}.png" alt="${gamesList[0].name}" />
            <h4>${gamesList[0].name}</h4>
            <p>${gamesList[0].genre}</p>
            <p>$${gamesList[0].price.toFixed(2)}</p>
        `;

        document.getElementById("featured2").innerHTML = `
            <img src="./images/${gamesList[1].name}.png" alt="${gamesList[1].name}" />
            <h4>${gamesList[1].name}</h4>
            <p>${gamesList[1].genre}</p>
            <p>$${gamesList[1].price.toFixed(2)}</p>
        `;

        document.getElementById("featured3").innerHTML = `
            <img src="./images/${gamesList[2].name}.png" alt="${gamesList[2].name}" />
            <h4>${gamesList[2].name}</h4>
            <p>${gamesList[2].genre}</p>
            <p>$${gamesList[2].price.toFixed(2)}</p>
        `;

        document.getElementById("featured4").innerHTML = `
            <img src="./images/${gamesList[3].name}.png" alt="${gamesList[3].name}" />
            <h4>${gamesList[3].name}</h4>
            <p>${gamesList[3].genre}</p>
            <p>$${gamesList[3].price.toFixed(2)}</p>
        `;

        document.getElementById("featured5").innerHTML = `
            <img src="./images/${gamesList[4].name}.png" alt="${gamesList[4].name}" />
            <h4>${gamesList[4].name}</h4>
            <p>${gamesList[4].genre}</p>
            <p>$${gamesList[4].price.toFixed(2)}</p>
        `;
    }
    else if(window.location.href.includes("games")) {
        gamesList = await loadGamesTable();
        const gameCards = document.getElementById("game-cards");
        gameCards.innerHTML = "";

        gamesList.forEach(game => {
            gameCards.innerHTML += `
                <article class="game-card">
                    <img src="./images/${game.name}.png" alt="${game.name}" />
                    <div>
                        <h3>${game.name}</h3>
                        <p>${game.genre}</p>
                        <p>$${game.price}</p>
                        <p>${game.releaseDate}</p>
                    </div>
                </article>
            `
        })
    }
});