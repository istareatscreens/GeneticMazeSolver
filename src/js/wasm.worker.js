
addEventListener('message', async (data) => {
    console.log("HELLO2")
    importScripts('maze_wasm.js');
    Module = await createModule();
    console.log(Module);
    self.addEventListener('gotCoordinates', async (event) => {
        self.postMessage(event.detail);

    })
    //void solveMaze(int populationSize, double perBitMutationRate, int plateauConstant, int maxGeneration)
    let { gen, mut, plat, pop } = data.data;
    console.log(gen);
    console.log(plat);
    console.log(pop);
    console.log(mut);
    Module.solveMaze(parseInt(pop), parseFloat(mut), parseInt(plat), parseInt(gen));
});
