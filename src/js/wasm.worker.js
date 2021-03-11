let didNotSolve = false;
addEventListener("message", async (data) => {
  importScripts("maze_wasm.js");
  Module = await createModule();
  self.addEventListener("gotCoordinates", async (event) => {
    if (event.detail.done === 3) {
      didNotSolve = true;
    }
    self.postMessage(event.detail);
  });
  //void solveMaze(int populationSize, double perBitMutationRate, int plateauConstant, int maxGeneration)
  let { gen, mut, plat, pop } = data.data;
  /*
  console.log(gen);
  console.log(plat);
  console.log(pop);
  console.log(mut);
  */
  Module.solveMaze(
    parseInt(pop),
    parseFloat(mut),
    parseInt(plat),
    parseInt(gen)
  );

  if (!didNotSolve) {
    self.postMessage("mazeDone");
  } else {
    self.postMessage("mazeFailed");
    didNotSolve = false;
  }
});
