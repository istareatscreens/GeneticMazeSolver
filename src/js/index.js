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

function drawPath(list, ctx, isDone, gen) {
    let textValue = document.querySelector("h1");
    textValue.textContent = "Generation: " + gen;
    ctx.stroke();
    ctx.beginPath();
    let startpoint = coordinateList[parseInt(list[1]) * mapWidth + parseInt(list[0])];
    ctx.moveTo(startpoint.x, startpoint.y);
    for (let i = 2; i < list.length - 1; i += 2) {
        let point = coordinateList[parseInt(list[i + 1]) * mapWidth + parseInt(list[i])];
        ctx.lineTo(point.x, point.y);
        if (isDone) {
            ctx.strokeStyle = "#FA9500";
        } else {
            ctx.strokeStyle = "#000000";
        }
        ctx.stroke();
    }

}

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
        let coordinates = (UTF8ToString(coord)).split((/[ ,]+/));
        drawPath(coordinates, ctx, done, gen);
    })

}

window.addEventListener('click', (event) => {
    Module.init();
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




