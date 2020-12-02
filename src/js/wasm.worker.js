
addEventListener('message', async (data) => {
    console.log("HELLO2")
    importScripts('maze_wasm.js');
    Module = await createModule();
    console.log(Module);
    self.addEventListener('gotCoordinates', async (event) => {
        self.postMessage(event.detail);

    })

    Module.init()
});
