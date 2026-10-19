const swappers = document.querySelectorAll("[data-screen]"); 
const screens = document.querySelectorAll('.screen');
const pokemonName = document.getElementById('pokemon-name');
const pokemonDexId = document.getElementById('pokedex-id');
const pokemonType = document.getElementById('pokemon-type');
const pokemonShiny = document.getElementById('shiny-value');
const openBoxButton = document.getElementById('open-box-button');
const resultCardImage = document.getElementById('result-card-photo');

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

openBoxButton.addEventListener("click", async () => {

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

});

function getRandomNumber(max) {

    return Math.floor(Math.random() * max) + 1;

}