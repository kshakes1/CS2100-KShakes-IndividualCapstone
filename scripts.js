const swappers = document.querySelectorAll("[data-screen]");
const screens = document.querySelectorAll('.screen');
console.log(swappers);

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