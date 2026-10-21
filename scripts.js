const swappers = document.querySelectorAll("[data-screen]"); 
const screens = document.querySelectorAll('.screen');
const pokemonName = document.getElementById('pokemon-name');
const pokemonDexId = document.getElementById('pokedex-id');
const pokemonType = document.getElementById('pokemon-type');
const pokemonShiny = document.getElementById('shiny-value');
const openBoxButton = document.getElementById('open-box-button');
const resultCardImage = document.getElementById('result-card-photo');
const collectionGrid = document.getElementById("card-display-box");
const collectionMessage = document.getElementById('collection-empty-message');

const collectionSearch = document.getElementById("collection-searchbar");
const collectionType = document.getElementById("collection-type-dropdown");
const collectionSort = document.getElementById("collection-sortby-dropdown");
const collectionShiny = document.getElementById("collection-shiny-check");

let collectionEntries = [];

collectionSearch.addEventListener("input", displayCollection);
collectionType.addEventListener("change", displayCollection);
collectionSort.addEventListener("change", displayCollection);
collectionShiny.addEventListener("change", displayCollection);

const batchSize = 30;
let batchOffset = 0;
const speciesCount = 1025;

const libraryGrid = document.getElementById("library-display-box");
const librarySearch = document.getElementById("library-searchbar");
const libraryType = document.getElementById("library-type-dropdown");
const librarySort = document.getElementById("library-sortby-dropdown");
const libraryShiny = document.getElementById("library-shiny-check");
const loadMoreButton = document.getElementById("library-load-more-button");
const libraryMessage = document.getElementById('library-empty-message');

librarySearch.addEventListener("input", doLibraryFilter);
librarySort.addEventListener("change", doLibraryFilter);
libraryType.addEventListener("change", doLibraryFilter);
libraryShiny.addEventListener("change", doLibraryFilter);

let fullLibraryList = [];
let currentLibraryList = [];

// variables for saving collection in local storage
const savedCollection = localStorage.getItem("collection");
const collection = savedCollection ? JSON.parse(savedCollection) : [];

// variables for daily limit testing
const TESTING = true;
const openBoxMessage = document.getElementById("open-box-message");

/**
 * hides each screen when correlating button is clicked
 */
swappers.forEach(swapper => {

    swapper.addEventListener("click", async () => {

        screens.forEach(screen => {

            screen.classList.add('hide');
        
        });
        
        const currentScreenId = swapper.dataset.screen;

        document.getElementById(currentScreenId).classList.remove('hide');

        if (currentScreenId === "collection-screen") {

            renderCollection();

        }

        if (currentScreenId === "library-screen") {

            if (fullLibraryList.length === 0) {

                await fillLibrary();

                loadLibraryBatch();

            }

        }

    });

});

/**
 * rolls for random pokemon when button is clicked
 */
openBoxButton.addEventListener("click", async () => {

    if (!TESTING && hasOpenedToday()) {

        return;

    }

    const pokemonId = getRandomNumber(1025);
    const isShiny = getRandomNumber(2) === 1;
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;

    const response = await fetch(url);
    const data = await response.json();

    pokemonName.textContent = data.name;
    pokemonDexId.textContent = data.id;
    pokemonType.textContent = data.types.map(t => t.type.name).join(", ");
    pokemonShiny.textContent = isShiny ? "Yes" : "No";

    resultCardImage.src = isShiny 
                        ? data.sprites.other.home.front_shiny || data.sprites.front_shiny
                        : data.sprites.other.home.front_default || data.sprites.front_default;
    resultCardImage.alt = isShiny
                        ? `shiny ${data.name}`
                        : data.name;

    collection.push({id: data.id, shiny: isShiny});
    localStorage.setItem("collection", JSON.stringify(collection));

    localStorage.setItem("lastOpened", new Date().toDateString());

    if (!TESTING) {
        lockOpenBox();
    }

});

loadMoreButton.addEventListener("click", loadLibraryBatch);

/**
 * returns a random number from 1 to max, inclusive
 * @param {number} max - the endpoint of the range of random numbers
 * @returns {number} the random number picked
 */
function getRandomNumber(max) {

    return Math.floor(Math.random() * max) + 1;

}

/**
 * checks if a lootbox has been opened for the day
 * @returns {boolean} whether or not a lootbox has been opened today
 */
function hasOpenedToday() {
    return localStorage.getItem("lastOpened") === new Date().toDateString();
}

/**
 * disables the open lootbox button and displays a message
 * @returns {object}
 */
function lockOpenBox() {
    openBoxButton.disabled = true;
    openBoxMessage.textContent = "You've opened today's box. Come back tomorrow!";
}

/**
 * creates card using stored data
 * @returns {void}
 */
function createCard(data, isShiny) {

    const card = document.createElement("li");
    card.classList.add("card");

    const sprite = document.createElement("img");
    sprite.src = isShiny
                ? data.sprites.other.home.front_shiny || data.sprites.front_shiny
                : data.sprites.other.home.front_default || data.sprites.front_default;
    sprite.alt = isShiny ? `shiny ${data.name}` : data.name;

    const name = document.createElement("p");
    name.classList.add("card-name");
    name.textContent = data.name;

    const id = document.createElement("p");
    id.classList.add("card-id");
    id.textContent = `#${data.id}`;

    const type = document.createElement("p");
    type.classList.add("card-type");
    type.textContent = data.types.map(t => t.type.name).join(", ");

    card.append(sprite, name, id, type);

    return card;

}

/**
 * Fetches every saved Pokémon, then displays them.
 */
async function renderCollection() {

    const results = await Promise.all(
        collection.map(entry =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${entry.id}`)
                .then(response => response.json())
        )
    );

    collectionEntries = results.map((data, i) => ({
        data: data,
        shiny: collection[i].shiny
    }));

    displayCollection();

}

/**
 * Filters and sorts the loaded collection, then draws the cards.
 */
function displayCollection() {

    const search = collectionSearch.value.trim().toLowerCase();
    const type = collectionType.value;
    const sortBy = collectionSort.value;
    const shinyOnly = collectionShiny.checked;

    let list = collectionEntries.filter(entry => entry.data.name.includes(search));

    if (type !== "all") {

        list = list.filter(entry => entry.data.types.some(t => t.type.name === type));

    }

    if (shinyOnly) {

        list = list.filter(entry => entry.shiny);

    }

    if (sortBy === "name") {

        list.sort((a, b) => a.data.name.localeCompare(b.data.name));

    } else {

        list.sort((a, b) => a.data.id - b.data.id);

    }

    if (collection.length === 0) {

        collectionMessage.textContent = "No Pokemon collected yet. Open your first box!";

    } else if (list.length === 0) {

        collectionMessage.textContent = "No Pokemon match these filters.";

    } else {

        collectionMessage.textContent = "";

    }

    collectionGrid.replaceChildren();
    list.forEach(entry => collectionGrid.append(createCard(entry.data, entry.shiny)));

}

async function loadLibraryBatch() {

    loadMoreButton.disabled = true;

    const batchList = currentLibraryList.slice(batchOffset, batchOffset + batchSize);

    const batchData = await Promise.all(

        batchList.map(item => 

            fetch(item.url)
                .then(response => response.json())

        )

    );

    batchData.forEach(entry => libraryGrid.append(createCard(entry, libraryShiny.checked)));
    batchOffset += batchList.length;

    loadMoreButton.disabled = batchOffset >= currentLibraryList.length;

}

async function fillLibrary() {

    const url = `https://pokeapi.co/api/v2/pokemon?limit=${speciesCount}&offset=0`;
    const response = await fetch(url);
    fullLibraryList = (await response.json()).results;
    currentLibraryList = fullLibraryList.slice();

}

function resetLibrary() {

    batchOffset = 0;
    libraryGrid.replaceChildren();
    loadLibraryBatch();

}

async function doLibraryFilter() {

    const search = librarySearch.value.trim().toLowerCase();
    const type = libraryType.value;
    const sortBy = librarySort.value;

    let list = fullLibraryList.filter(entry => entry.name.includes(search));

    if (type !== "all") {

        const typeUrl = `https://pokeapi.co/api/v2/type/${type}`;
        const typeResponse = await fetch(typeUrl);
        const typeData = await typeResponse.json();

        const typeNames = typeData.pokemon.map(data => data.pokemon.name);

        list = list.filter(entry => typeNames.includes(entry.name));

    }
    
    if (sortBy === "name") {

        list.sort((a, b) => a.name.localeCompare(b.name));

    }

    if (list.length === 0) {

        libraryMessage.textContent = "No Pokemon match these filters.";

    } else {

        libraryMessage.textContent = "";

    }

    currentLibraryList = list;
    resetLibrary();

}
