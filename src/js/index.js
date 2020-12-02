//Draw canvas
//Map dimensions

let worker;
const mapHeight = 10;
const mapWidth = 15;
const map =
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 4, 0, 1,
        2, 0, 0, 0, 0, 4, 0, 0, 1, 1, 1, 0, 0, 0, 1,
        1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1,
        1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1,
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1,
        1, 4, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3,
        1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 4, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

const coordinateList = [];

function calculateDimension(ctx) {
    let width = ctx.canvas.width;
    let height = ctx.canvas.height;
    if (width < height) {
        return Math.sqrt(width * width / (mapWidth * mapHeight));
    } else {
        return Math.sqrt(height * height / (mapWidth * mapHeight));
    }
}

/*
window.addEventListener('mousemove', (event) => {
    console.log("x " + event.x + " y: " + event.y);
})
*/
function generateTile(boarderColor, color, ctx) {
    return (dimension, x, y) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = boarderColor;
        ctx.stroke();
        ctx.fillRect(x, y, dimension, dimension)
        return {
            "x": x + dimension / 2,
            "y": y + dimension / 2
        }
    }
}

function resizeCanvas(ctx) {
    //Set canvas size
    return () => {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        generateMap(ctx)
        let textValue = document.querySelector("h1");
        textValue.textContent = "Click Run to Run!";
    }
}



function init() {
    var worker = new Worker('./lib/wasm.worker.js');

    //Set canvas size
    let canvas = document.querySelector("canvas");
    const ctx = canvas.getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    generateMap(ctx);
    window.addEventListener("resize", resizeCanvas(ctx), false);

    window.addEventListener('gotCoordinates', (event) => {
        //len isnt used
        let { coord, done, gen } = event.detail;
        console.log("HELLO");
        let list = (UTF8ToString(coord)).split((/[ ,]+/));
        //ctx.stroke();
        //ctx.beginPath();
        //let startpoint = coordinateList[parseInt(list[1]) * mapWidth + parseInt(list[0])];
        //ctx.moveTo(startpoint.x, startpoint.y);

        let textValue = document.querySelector("h1");
        textValue.textContent = "Generation: " + gen;
        let i = 2;
        window.requestAnimationFrame(function animate() {
            ctx.beginPath();
            //let startpoint = coordinateList[parseInt(list[1]) * mapWidth + parseInt(list[0])];
            if (i < list.length - 1) {
                let point1 = coordinateList[parseInt(list[i - 1]) * mapWidth + parseInt(list[i - 2])];
                let point2 = coordinateList[parseInt(list[i + 1]) * mapWidth + parseInt(list[i])];
                ctx.moveTo(point1.x, point1.y);
                ctx.lineTo(point2.x, point2.y);
                if (done) {
                    ctx.strokeStyle = "#FA9500";
                } else {
                    ctx.strokeStyle = "#000000";
                }
                ctx.stroke();
                i += 2
                window.requestAnimationFrame(animate);
            }
        });
    })
}


window.addEventListener('click', (event) => {
    worker.postMessage({ runWasm: "run" });
    //Module.init();
})

function generateMap(ctx) {
    const createTile = drawTile(ctx);
    const dimension = calculateDimension(ctx);
    let centerX = (ctx.canvas.width - dimension * mapWidth) / 2
    let centerY = (ctx.canvas.height - dimension * mapHeight) / 2
    let x = centerX;
    let y = centerY;
    coordinateList.length = 0;
    for (let i = 0; i < mapHeight; i++) {
        for (let j = 0; j < mapWidth; j++) {
            //draw rectangles and get center coordinates array for drawing lines
            coordinateList.push(createTile(map[i * mapWidth + j], dimension, x, y));
            x += dimension;
        }
        y += dimension;
        x = centerX;
    }
}

function drawTile(ctx) {
    //Tile types
    let enterance = generateTile("#EFF6EE", "#EFF6EE", ctx);
    let exit = generateTile("#FCCA46", "#FCCA46", ctx);
    let wall = generateTile("#1D263B", "#1D263B", ctx);
    let floor = generateTile("#1D263B", "#4CB963", ctx);
    let enemy = generateTile("#F02D3A", "#F02D3A", ctx);
    return (typeValue, dimension, x, y) => {
        switch (typeValue) {
            case 0:
                return floor(dimension, x, y);
            case 1:
                return wall(dimension, x, y);
            case 2:
                return enterance(dimension, x, y);
            case 3:
                return exit(dimension, x, y);
            case 4:
                return enemy(dimension, x, y);
            default:
                console.log("invalid tile type exiting");
                exit();
        }

    }
}




