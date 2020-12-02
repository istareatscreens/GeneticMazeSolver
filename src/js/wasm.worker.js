addEventListener('message', async (data) => {
    importScripts('maze_wasm.js');
    Module = await createModule();
    Module.init()
});

