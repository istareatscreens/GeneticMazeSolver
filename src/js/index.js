//Draw canvas
//Map dimensions


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
    let shrinkFactor = 1;
    if (width < 1050) {
        shrinkFactor = (width / 1050);
    } else if (width < 850) {
        shrinkFactor = (width / 1050) * 0.2;
    } else if (width < 500) {
        shrinkFactor = (width / 1050) * 0.05;
    }

    if (width < height) {
        return Math.sqrt(shrinkFactor * width * width / (mapWidth * mapHeight));
    } else {
        return Math.sqrt(shrinkFactor * height * height / (mapWidth * mapHeight));
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



function init() {

    let worker = new Worker('./lib/wasm.worker.js');
    let ctx = document.querySelector("canvas").getContext('2d');

    //Set canvas size
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    generateMap(ctx);

    //Event listeners
    window.addEventListener("resize", () => {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        generateMap(ctx)
        let textValue = document.querySelector("h1");
        textValue.textContent = "Click Run to Run!";
    }, false);

    let btn = document.querySelector("button");
    btn.addEventListener('click', (event) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();
        generateMap(ctx)
        let pop = document.getElementById('pop').value;
        let mut = document.getElementById('mut').value;
        let plat = document.getElementById('plat').value;
        let gen = document.getElementById('gen').value;

        worker.postMessage({
            pop: pop,
            mut: mut,
            plat: plat,
            gen: gen
        })
    })

    worker.onmessage = function (event) {
        let { coord, gen, done } = event.data;
        let textValue = document.querySelector("h1");
        textValue.textContent = "Generation: " + gen;
        let list = coord.split(',');
        if (done) {
            ctx.strokeStyle = "#FA9500";
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 0.5;
        }
        for (let i = 2; i < list.length - 1; i = i + 2) {
            ctx.beginPath();
            let point1 = coordinateList[parseInt(list[i - 1]) * mapWidth + parseInt(list[i - 2])];
            let point2 = coordinateList[parseInt(list[i + 1]) * mapWidth + parseInt(list[i])];
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.stroke();
        }
    };


    function generateMap(ctx) {
        const createTile = drawTile(ctx);
        const dimension = calculateDimension(ctx);
        let centerX;
        let centerY;
        if (1000 > ctx.canvas.width) {
            centerX = (ctx.canvas.width - dimension * mapWidth) / 2;
            centerY = (ctx.canvas.height - dimension * mapHeight) - 100;
        } else {
            centerX = (ctx.canvas.width - dimension * mapWidth) / 2
            centerY = (ctx.canvas.height - dimension * mapHeight) / 2
        }
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




