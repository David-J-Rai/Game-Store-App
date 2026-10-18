const API_BASE_URL = "http://localhost:5002";
const CART_STORAGE_KEY = "my-game-store-cart";
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
});

async function loadGames() {
    const response = await fetch(`${API_BASE_URL}/games`);

    if (!response.ok) {
        throw new Error(`Games request failed with status ${response.status}`);
    }

    const games = await response.json();
    if (!Array.isArray(games)) {
        throw new Error("The games API returned an invalid response.");
    }

    return games;
}

async function loadGame(gameId) {
    const response = await fetch(`${API_BASE_URL}/games/${encodeURIComponent(gameId)}`);

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Game request failed with status ${response.status}`);
    }

    return response.json();
}

function readCart() {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) {
        return [];
    }

    try {
        const cart = JSON.parse(storedCart);
        if (!Array.isArray(cart)) {
            throw new Error("Stored cart is not an array.");
        }

        return cart.filter(item => Number.isInteger(item.gameId)
            && Number.isInteger(item.quantity)
            && item.quantity > 0);
    } catch (error) {
        console.error("Unable to read the saved cart:", error);
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = [...document.querySelectorAll("#cart-count")][0];
    if (!count) {
        return;
    }

    const itemCount = readCart().reduce((total, item) => total + item.quantity, 0);
    count.textContent = String(itemCount);
    count.setAttribute("aria-label", `${itemCount} ${itemCount === 1 ? "item" : "items"} in cart`);
}

function addGameToCart(game) {
    const cart = readCart();
    const existingItem = cart.find(item => item.gameId === game.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ gameId: game.id, quantity: 1 });
    }

    saveCart(cart);
}

function createGameCard(game, className) {
    const card = document.createElement("a");
    card.className = className;
    card.href = `./game.html?id=${encodeURIComponent(game.id)}`;
    card.setAttribute("aria-label", `View ${game.name}`);

    const image = document.createElement("img");
    image.src = `./images/${encodeURIComponent(`${game.name}.png`)}`;
    image.alt = `${game.name} cover art`;
    image.loading = "lazy";
    image.addEventListener("error", () => {
        image.hidden = true;
    }, { once: true });

    const details = document.createElement("div");
    details.className = "game-details";

    const title = document.createElement("h3");
    title.textContent = game.name;

    const genre = document.createElement("p");
    genre.className = "game-genre";
    genre.textContent = game.genre;

    const price = document.createElement("p");
    price.className = "game-price";
    price.textContent = CURRENCY_FORMATTER.format(game.price);

    details.append(title, genre, price);

    if (game.releaseDate) {
        const releaseDate = document.createElement("p");
        releaseDate.className = "game-release-date";
        releaseDate.textContent = `Released ${DATE_FORMATTER.format(new Date(`${game.releaseDate}T00:00:00`))}`;
        details.append(releaseDate);
    }

    card.append(image, details);
    return card;
}

function getRandomItems(items, count) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled.slice(0, count);
}

async function initializeHomePage() {
    const featuredGames = document.getElementById("featured-games");
    if (!featuredGames) {
        return;
    }

    const status = document.getElementById("featured-status");

    try {
        const games = await loadGames();
        status.hidden = true;

        if (games.length === 0) {
            status.textContent = "There are no games to feature just yet. Please check back soon.";
            status.hidden = false;
            return;
        }

        getRandomItems(games, 5).forEach(game => {
            featuredGames.append(createGameCard(game, "game-card featured-card"));
        });
    } catch (error) {
        console.error("Unable to load featured games:", error);
        status.textContent = "Featured games are unavailable right now. Please try again later.";
    }
}

function compareGames(first, second, sortOrder) {
    switch (sortOrder) {
        case "name-desc":
            return second.name.localeCompare(first.name);
        case "price-asc":
            return first.price - second.price;
        case "price-desc":
            return second.price - first.price;
        case "release-asc":
            return first.releaseDate.localeCompare(second.releaseDate);
        case "release-desc":
            return second.releaseDate.localeCompare(first.releaseDate);
        default:
            return first.name.localeCompare(second.name);
    }
}

function initializeCatalog(games) {
    const cards = document.getElementById("game-cards");
    const searchInput = document.getElementById("game-search");
    const genreFilter = document.getElementById("genre-filter");
    const sortSelect = document.getElementById("game-sort");
    const count = document.getElementById("catalog-count");
    const status = document.getElementById("games-status");
    const genres = [...new Set(games.map(game => game.genre))].sort((a, b) => a.localeCompare(b));

    genres.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreFilter.append(option);
    });

    function renderGames() {
        const query = searchInput.value.trim().toLocaleLowerCase();
        const selectedGenre = genreFilter.value;
        const visibleGames = games
            .filter(game => (!selectedGenre || game.genre === selectedGenre)
                && (!query || `${game.name} ${game.genre}`.toLocaleLowerCase().includes(query)))
            .sort((first, second) => compareGames(first, second, sortSelect.value));

        cards.replaceChildren(...visibleGames.map(game => createGameCard(game, "game-card")));
        count.textContent = `${visibleGames.length} ${visibleGames.length === 1 ? "game" : "games"}`;

        if (visibleGames.length === 0) {
            status.textContent = games.length === 0
                ? "No games are available yet. Please check back soon."
                : "No games match your search. Try changing your search or filters.";
            status.hidden = false;
        } else {
            status.hidden = true;
        }
    }

    searchInput.addEventListener("input", renderGames);
    genreFilter.addEventListener("change", renderGames);
    sortSelect.addEventListener("change", renderGames);
    renderGames();
}

async function initializeGamesPage() {
    const cards = document.getElementById("game-cards");
    if (!cards) {
        return;
    }

    const status = document.getElementById("games-status");
    const errorPanel = document.getElementById("games-error");
    const retryButton = document.getElementById("retry-games");

    async function fetchAndRenderGames() {
        status.textContent = "Loading games...";
        status.hidden = false;
        errorPanel.hidden = true;

        try {
            const games = await loadGames();
            status.hidden = true;
            initializeCatalog(games);
        } catch (error) {
            console.error("Unable to load the game catalog:", error);
            status.hidden = true;
            errorPanel.hidden = false;
        }
    }

    retryButton.addEventListener("click", fetchAndRenderGames);
    await fetchAndRenderGames();
}

async function initializeGameDetailPage() {
    const detail = document.getElementById("game-detail");
    if (!detail) {
        return;
    }

    const status = document.getElementById("game-status");
    const errorPanel = document.getElementById("game-error");
    const errorMessage = document.getElementById("game-error-message");
    const gameId = Number(new URLSearchParams(window.location.search).get("id"));

    if (!Number.isInteger(gameId) || gameId < 1) {
        status.hidden = true;
        errorMessage.textContent = "This game link is missing a valid game ID.";
        errorPanel.hidden = false;
        return;
    }

    try {
        const game = await loadGame(gameId);

        if (!game) {
            status.hidden = true;
            errorMessage.textContent = "This game could not be found. It may have been removed from the store.";
            errorPanel.hidden = false;
            return;
        }

        document.title = `${game.name} - My Game Store`;
        detail.replaceChildren();

        const image = document.createElement("img");
        image.className = "detail-image";
        image.src = `./images/${encodeURIComponent(`${game.name}.png`)}`;
        image.alt = `${game.name} cover art`;
        image.addEventListener("error", () => {
            image.hidden = true;
        }, { once: true });

        const information = document.createElement("div");
        information.className = "detail-information";

        const genre = document.createElement("p");
        genre.className = "eyebrow";
        genre.textContent = game.genre;

        const title = document.createElement("h1");
        title.textContent = game.name;

        const price = document.createElement("p");
        price.className = "detail-price";
        price.textContent = CURRENCY_FORMATTER.format(game.price);

        const releaseDate = document.createElement("p");
        releaseDate.className = "detail-release-date";
        releaseDate.textContent = `Released ${DATE_FORMATTER.format(new Date(`${game.releaseDate}T00:00:00`))}`;

        const description = document.createElement("p");
        description.className = "detail-description";
        description.textContent = `Add ${game.name} to your collection and enjoy a ${game.genre.toLowerCase()} adventure.`;

        const addButton = document.createElement("button");
        addButton.className = "btn";
        addButton.type = "button";
        addButton.textContent = "Add to cart";

        const addStatus = document.createElement("p");
        addStatus.className = "cart-notice";
        addStatus.setAttribute("role", "status");
        addStatus.setAttribute("aria-live", "polite");

        addButton.addEventListener("click", () => {
            try {
                addGameToCart(game);
                addStatus.textContent = `${game.name} added to your cart.`;
            } catch (error) {
                console.error("Unable to save the cart:", error);
                addStatus.textContent = "We couldn't save your cart. Check your browser storage settings and try again.";
            }
        });

        information.append(genre, title, price, releaseDate, description, addButton, addStatus);
        detail.append(image, information);
        detail.hidden = false;
        status.hidden = true;
    } catch (error) {
        console.error("Unable to load game details:", error);
        status.hidden = true;
        errorMessage.textContent = "We couldn't load this game. Check that the Game Store API is running and try again.";
        errorPanel.hidden = false;
    }
}

async function initializeCartPage() {
    const cartItems = document.getElementById("cart-items");
    if (!cartItems) {
        return;
    }

    const status = document.getElementById("cart-status");
    const layout = document.getElementById("cart-layout");
    const empty = document.getElementById("cart-empty");
    const errorPanel = document.getElementById("cart-error");
    const subtotal = document.getElementById("cart-subtotal");
    const notice = document.getElementById("cart-notice");
    const retryButton = document.getElementById("retry-cart");

    function renderCart(games) {
        const cart = readCart();
        const gameById = new Map(games.map(game => [game.id, game]));
        const cartEntries = cart.map(item => ({
            ...item,
            game: gameById.get(item.gameId)
        }));
        const availableEntries = cartEntries.filter(entry => entry.game);

        cartItems.replaceChildren();
        cartEntries.forEach(entry => {
            const row = document.createElement("article");
            row.className = "cart-item";

            const itemInfo = document.createElement("div");
            itemInfo.className = "cart-item-info";
            const title = document.createElement("h2");
            title.textContent = entry.game ? entry.game.name : "Unavailable game";
            const genre = document.createElement("p");
            genre.textContent = entry.game ? entry.game.genre : "This game is no longer in the catalog.";
            itemInfo.append(title, genre);

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";
            const quantityLabel = document.createElement("label");
            quantityLabel.textContent = "Qty";
            const quantityInput = document.createElement("input");
            quantityInput.type = "number";
            quantityInput.min = "1";
            quantityInput.step = "1";
            quantityInput.value = String(entry.quantity);
            quantityInput.setAttribute("aria-label", `Quantity for ${title.textContent}`);
            quantityLabel.append(quantityInput);

            const itemTotal = document.createElement("strong");
            itemTotal.className = "cart-item-total";
            itemTotal.textContent = entry.game
                ? CURRENCY_FORMATTER.format(entry.game.price * entry.quantity)
                : "Unavailable";

            const removeButton = document.createElement("button");
            removeButton.className = "remove-item";
            removeButton.type = "button";
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => {
                saveCart(readCart().filter(item => item.gameId !== entry.gameId));
                renderCart(games);
            });

            quantityInput.addEventListener("change", () => {
                const quantity = Number(quantityInput.value);
                if (!Number.isInteger(quantity) || quantity < 1) {
                    quantityInput.value = String(entry.quantity);
                    return;
                }

                const updatedCart = readCart().map(item => item.gameId === entry.gameId
                    ? { ...item, quantity }
                    : item);
                saveCart(updatedCart);
                renderCart(games);
            });

            controls.append(quantityLabel, itemTotal, removeButton);
            row.append(itemInfo, controls);
            cartItems.append(row);
        });

        const total = availableEntries.reduce((sum, entry) => sum + entry.game.price * entry.quantity, 0);
        subtotal.textContent = CURRENCY_FORMATTER.format(total);
        layout.hidden = cartEntries.length === 0;
        empty.hidden = cartEntries.length !== 0;
        status.hidden = true;
        notice.textContent = cartEntries.some(entry => !entry.game)
            ? "Some games in your cart are no longer available. Remove them to update your cart."
            : "";
    }

    async function loadAndRenderCart() {
        status.textContent = "Loading your cart...";
        status.hidden = false;
        layout.hidden = true;
        empty.hidden = true;
        errorPanel.hidden = true;

        try {
            const cart = readCart();
            if (cart.length === 0) {
                status.hidden = true;
                empty.hidden = false;
                return;
            }

            renderCart(await loadGames());
        } catch (error) {
            console.error("Unable to load the cart:", error);
            status.hidden = true;
            errorPanel.hidden = false;
        }
    }

    retryButton.addEventListener("click", loadAndRenderCart);
    await loadAndRenderCart();
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    window.addEventListener("storage", event => {
        if (event.key === CART_STORAGE_KEY) {
            updateCartCount();
        }
    });
    initializeHomePage();
    initializeGamesPage();
    initializeGameDetailPage();
    initializeCartPage();
});
