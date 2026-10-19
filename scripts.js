const swappers = document.querySelectorAll("[data-screen]"); 
const screens = document.querySelectorAll('.screen');
const pokemonName = document.getElementById('pokemon-name');
const pokemonDexId = document.getElementById('pokedex-id');
const pokemonType = document.getElementById('pokemon-type');
const pokemonShiny = document.getElementById('shiny-value');
const openBoxButton = document.getElementById('open-box-button');
const resultCardImage = document.getElementById('result-card-photo');

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

    swapper.addEventListener("click", () => {

        console.log(swapper.dataset.screen);

        screens.forEach(screen => {

            screen.classList.add('hide');
        
        });
        
        const currentScreenId = swapper.dataset.screen;

        document.getElementById(currentScreenId).classList.remove('hide');

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
                        ? data.sprites.other.showdown.front_shiny || data.sprites.front_shiny
                        : data.sprites.other.showdown.front_default || data.sprites.front_default;
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
 * @param none
 * @returns {boolean} whether or not a lootbox has been opened today
 */
function hasOpenedToday() {
    return localStorage.getItem("lastOpened") === new Date().toDateString();
}

/**
 * disables the open lootbox button and displays a message
 * @returns {void}
 */
function lockOpenBox() {
    openBoxButton.disabled = true;
    openBoxMessage.textContent = "You've opened today's box. Come back tomorrow!";
}
