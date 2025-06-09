var AllTiles = [];
const REPLACE_BIG = 80 //percent chance that 4 tiles are merged into one big tile
const D_RATIO = 100 //percent of chunks that use designed regions as opposed to generated ones
const F = 10; //just for easier readability for the designed regions; stands for filled
// p = percent chance divided by 10 that a space is filled with a tile
// s = if this region be stacked vertically ontop of another region
// y0 = y player is expected to be at (the first defined row is y = 1; 0 is atop the whole construction)
// y1 = y player is expected to exit at
var designedRegions = [
    {s: false, y0:3, y1: 0, p: [
        [0,0,1,1,5,F],
        [0,0,0,5,F,F],
        [0,0,0,F,F,F],
        [0,0,F,F,F,F]
    ]}, //assending staircase
    {s: false, y0:3, y1: 0, p: [
        [0,0,0,0,0,F],
        [0,0,5,F,5,0],
        [0,0,0,0,0,0],
        [0,F,F,5,1,0]
    ]}, //assending platforms
    {s: false, y0:0, y1: 3, p: [
        [F,5,1,1,0,0],
        [F,F,5,0,0,0],
        [F,F,F,0,0,0],
        [F,F,F,F,0,0]
    ]}, //descending staircase
    {s: false, y0:0, y1: 0, p: [
        [F,5,1,0,F],
        [F,F,5,0,1],
        [F,F,F,0,0]
    ]}, //descending staircase kinda
    {s: false, y0:7, y1: 5, p: [
        [F,F,F,9,6,F,F,F,F,F,F],
        [F,F,F,8,1,0,0,0,4,F,F],
        [F,3,3,F,F,0,0,0,0,0,F],
        [F,1,1,F,F,F,0,0,0,0,0],
        [F,1,0,0,0,0,9,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,F,F],
        [0,0,0,0,0,0,0,0,0,3,F],
        [F,F,1,1,1,5,F,5,1,F,F],
    ]}, //small cave
    {s: false, y0:10, y1: 4, p: [
        [F,F,F,F,F,F,F,F,F,F,F],
        [F,F,F,8,3,0,0,0,4,F,F],
        [F,1,0,0,0,0,0,0,0,0,0],
        [9,0,0,0,0,0,F,F,0,0,0],//y = 4
        [9,0,0,0,0,0,0,0,0,F,F],
        [F,0,0,F,F,0,0,0,0,0,F],
        [F,0,0,F,F,F,0,0,0,0,9],
        [F,0,0,0,0,0,F,0,0,0,9],
        [0,0,0,0,0,0,0,0,0,F,F],
        [0,0,0,0,0,0,0,0,0,3,F],//y = 10
        [F,F,1,1,1,5,F,5,1,F,F],
    ]}, //cave
    {s: false, y0:10, y1: 0, p: [
        [F,0,0,0,0,F],
        [F,F,5,0,F,F],
        [F,1,0,0,0,9],
        [9,0,0,F,0,9],
        [9,0,0,0,0,9],
        [9,F,0,0,0,9],
        [9,F,F,0,0,9],
        [F,0,0,0,0,F],
        [0,0,0,0,F,F],
        [0,0,0,0,3,F],
        [F,7,F,9,F,F],
    ]}, //tower
    {s: false, y0:0, y1: 0, p: [
        [F,3,0,0,F],
        [0,0,7,0,0],
        [F,1,0,F,F],
        [5,F,F,F,5]
    ]} //smiley face
]

class LEVEL {
    constructor(p,possibleimages){
        AllColliders = []; // clear colliders (for reseting)
        AllTiles = []; //clear tiles
        this.p = p;

        p.player = new PLAYER(p, p.playerSprites);

        p.spawnKeys();
        /*
        if (p.door) 
            p.door.reset();
        const br = Math.floor(p.height / TILESIZE) - 1;
        const dX = p.worldWidth - 3 * TILESIZE;
        const dY = br * TILESIZE + 18 - TILESIZE * 2;
        p.door = new Door(p, dX, dY, p.doorClosedImg, p.doorUnlockedImg, p.doorOpenImg);
        */
        this.debug = new CHUNK(p,0,0,possibleimages)
    }
    draw(){
        //draw key
        for (let k of this.p.keys) {
            k.draw();
        }

        //draw door
        this.p.door.draw();

        //draw tiles
        for (let i = 0; i < AllTiles.length; i ++){
            AllTiles[i].draw();
        }

        //draw player
        this.p.player.draw();
    }
}

//xStart = xStart of previous chunk plus previous chunks width; starting x value of current chunk
//playerYAtChunkStart = yvalue of the floor created within the previous chunk
class CHUNK {
    constructor(p,xStart,playerYAtChunkStart,possibleimages){
        this.x = xStart;
        this.startY = playerYAtChunkStart;
        this.tiles = [];
        let design = [];
        let doGenerate = Math.random()*100 > D_RATIO;
        if (doGenerate){
            this.w = Math.floor(Math.random()*20+5)*TILESIZE;
            this.h = Math.floor(Math.random()*20+5)*TILESIZE;
            for (let y = 0; y < this.h; y++){
                let temp = [];
                for (let x = 0; x < this.w; x++)
                    temp.push(0);
                design.push(temp)
            }
            //generate somn interesting
        }else{
            design = (p.random(designedRegions))["p"].slice();
            console.log(p.random(designedRegions).p.slice());
            this.w = design[0].length;
            this.h = design.length;
        }
        for (let y = 0; y < this.h; y++){
            for (let x = 0; x < this.w; x++){
                if (Math.random()*9 >= design[y][x])
                    continue;
                if (design[y+1] && design[y+1][x] && design[y+1][x+1] && design[y][x+1] && (Math.random()*100 < REPLACE_BIG)){
                    design[y+1][x] = -1;
                    design[y+1][x+1] = -1;
                    design[y][x+1] = -1;
                    new TILE(p,x+this.x,y+this.startY,p.random(possibleimages.big));
                }else{
                    new TILE(p,x+this.x,y+this.startY,p.random(possibleimages.sml));
                    console.log("?")
                }
            }
        }
    }
}

//assumes TILESIZE is equal to 4 divided by the width or the hight of the image
//works fine if this is not the case but will likely not be aligned with the grid and may generate holes in the level geometry
class TILE{
    constructor(p,x,y,image,screenCoords = false){
        this.p = p;
        this.image = image;
        this.w = image.width * 4;
        this.h = image.height * 4;
        this.x = x;
        this.y = y;
        if (!screenCoords){
            this.x *= TILESIZE;
            this.y *= TILESIZE;
        }
        this.col = new COLLIDER(this.w,this.h,this.x,this.y);
        AllTiles.push(this);
    }
    draw(){
        this.p.image(this.image,this.x,this.y,this.w,this.h);
    }
}

/*
    p.generatePlatforms = function() {
        for (let y = 0; y < p.height/TILESIZE; y++) {
            p.platforms[y] = []
        }
        for (let y = 0; y < p.height/TILESIZE; y++) {
            for (let x = 0; x < p.worldWidth/TILESIZE; x++) {
                if (x < 5) {
                    p.platforms[y][x] = -1
                } else if (p.random() < 0.01) {
                    p.generateSubArea(0,x,y)
                } else if (p.random() < 0.02) {
                    p.generateSubArea(1,x,y)
                } else if (p.platforms[y][x] == null) {
                    p.platforms[y][x] = 0
                }
            }
        }
        // Add walls at both ends of the level
        for (let y = 0; y < p.height/TILESIZE; y++) {
            // Left wall
            p.platforms[y][0] = 1;
            new COLLIDER(TILESIZE, TILESIZE, 0, y*TILESIZE+18);
            
            // Right wall
            p.platforms[y][p.worldWidth/TILESIZE - 1] = 1;
            new COLLIDER(TILESIZE, TILESIZE, (p.worldWidth/TILESIZE - 1)*TILESIZE, y*TILESIZE+18);
        }
        // Fill bottom row with solid tiles and colliders
        let bottomRow = Math.floor(p.height / TILESIZE) - 1;
        for (let x = 0; x < p.worldWidth / TILESIZE; x++) {
            p.platforms[bottomRow][x] = 2;
            new COLLIDER(
                TILESIZE,
                TILESIZE,
                x * TILESIZE,
                bottomRow * TILESIZE + 18
            );
        }

        console.log(p.platforms)
    }

    p.generateSubArea = function(subAreaNum, x, y) {
        console.log(platformAreas[subAreaNum])
        for (let j = 0; j < platformAreas[subAreaNum].length; j++) {
            for (let i = 0; i < platformAreas[subAreaNum][0].length; i++) {
                console.log(i,j,platformAreas[subAreaNum][j][i])
                if (p.platforms[y+j] != undefined && platformAreas[subAreaNum][j][i] != 0) {
                    p.platforms[y+j][x+i] = platformAreas[subAreaNum][j][i]
                    new COLLIDER(TILESIZE, TILESIZE,(x+i)*TILESIZE, (y+j)*TILESIZE+18);
                }
            }
        }
    }
    */