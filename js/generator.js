var AllTiles = [];
const REPLACE_BIG = 50 //percent chance that 4 tiles are merged into one big tile
const PLATFORM_SIZE = 7; //number of tiles that make up a generated platform
const D_RATIO = 50 //percent of chunks that use designed regions as opposed to generated ones
const F = 10; //just for easier readability for the designed regions; stands for filled
// p = percent chance divided by 10 that a space is filled with a tile
// y0 = y player is expected to be at (the first defined row is y = 1; 0 is atop the whole construction)
// y1 = y player is expected to exit at
function shuffle(array, p = Math){
    for (let i = array.length -1; i >= 0; i--){
        let temp = array[i];
        let index = Math.floor(p.random()*i)
        array[i] = array[index];
        array[index] = temp;
    }
    return array;
}

var designedRegions = [
    {y0:3, y1: 0, p: [
        [0,0,5,F,0,0],//y = 1 (0 is above this)
        [0,5,F,F,0,0],//y = 2
        [0,F,F,F,1,0],//y = 3
        [F,F,F,F,1,0] //y = 4
    ]}, //assending staircase
    {y0:3, y1: 0, p: [
        [0,0,0,0,0,F],
        [0,0,5,F,5,0],
        [0,0,0,0,0,0],
        [F,F,0,5,1,0]
    ]}, //assending platforms
    {y0:0, y1: 3, p: [
        [F,5,0,0,0,1],
        [F,F,5,0,0,1],
        [F,F,F,0,0,0],
        [F,F,F,F,0,0]
    ]}, //descending staircase
    {y0:0, y1: 0, p: [
        [F,5,1,0,F],
        [F,F,5,0,1],
        [F,F,F,0,0]
    ]}, //descending staircase kinda
    {y0:0, y1: 9, p: [
        [F,0,0,9,6,F,F,F,F,F,F],
        [F,0,0,0,0,0,0,0,4,F,F],
        [F,3,F,F,F,0,0,0,0,0,F],
        [F,1,1,F,F,F,F,5,0,5,F],
        [F,1,0,0,0,0,0,0,0,0,9],
        [F,F,0,0,0,0,5,F,F,F,F],
        [F,F,F,0,0,F,F,9,5,3,F],
        [1,0,0,0,0,0,0,0,9,F,0],
        [9,0,0,0,0,0,0,0,0,0,0],
        [F,F,1,1,1,F,F,5,F,F,F],
    ]}, //tight cave
    {y0:3, y1: 9, p: [
        [F,F,9,9,6,F,F,F,F,F,F],
        [0,0,0,0,0,0,0,0,0,0,F],
        [0,F,F,F,F,1,0,F,F,0,F],
        [F,1,1,F,F,F,F,5,0,0,F],
        [F,1,0,0,0,0,0,0,0,0,9],
        [F,0,0,F,F,9,5,F,F,F,F],
        [F,0,F,0,0,F,F,0,0,3,F],
        [0,0,0,0,0,0,0,0,0,F,0],
        [0,0,0,0,0,0,0,0,0,0,0],
        [F,F,1,1,1,F,F,5,F,F,F],
    ]}, //tighter cave
    {y0:7, y1: 9, p: [
        [0,0,0,0,F,F,F,0,0,0,0],
        [0,0,0,F,1,1,1,F,0,0,0],
        [F,0,0,F,1,1,1,F,0,0,F],
        [0,0,0,0,F,F,F,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,0],
        [0,0,0,0,0,0,F,0,1,0,0],
        [0,F,F,0,1,0,0,0,0,0,0],
        [F,1,1,F,0,0,0,0,0,0,0],
        [F,1,1,F,0,0,0,F,F,0,0],
        [0,F,F,0,0,0,F,1,1,F,0],
        [0,0,0,0,0,0,0,F,F,0,0],
    ]}, //bubbles
    {y0:9, y1: 9, p: [
        [0,0,F,0,0,0,0,0],
        [F,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,F,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [F,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,F,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [F,F,F,0,0,0,0,0],
    ]}, //tall
    {y0:7, y1: 5, p: [
        [0,F,F,F,9,6,F,F,F,F,F,F,0],
        [F,F,F,F,8,1,0,0,0,4,F,F,F],
        [F,F,3,3,F,F,0,0,0,0,0,F,F],
        [F,F,1,1,F,F,F,0,0,0,0,0,0],
        [F,F,0,0,0,0,0,9,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,F,F,F],
        [0,0,0,0,0,0,0,0,0,0,3,F,F],
        [F,F,F,1,1,1,5,F,5,1,F,F,0],
    ]}, //small cave
    {y0:0, y1: 0, p: [
        [F,F,0,0,0,0,5,F,F]
    ]}, //big jump
    {y0:10, y1: 4, p: [
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
    {y0:10, y1: 0, p: [
        [F,0,0,0,0,F],
        [7,F,0,0,F,F],
        [F,0,0,0,0,9],
        [0,0,0,F,0,9],
        [0,0,0,0,0,9],
        [F,F,0,0,0,9],
        [7,F,F,0,0,9],
        [F,0,0,0,0,F],
        [0,0,0,0,F,F],
        [0,0,0,0,3,F],
        [F,5,F,5,F,7],
    ]}, //tower
    {y0:0, y1: 0, p: [
        [F,3,0,0,F],
        [0,0,5,0,0],
        [F,1,0,F,F],
        [0,F,F,F,1]
    ]} //smiley face
]

class LEVEL {
    constructor(p,possibleimages){
        AllColliders = []; // clear colliders (for reseting)
        AllTiles = []; //clear tiles
        this.p = p;

        this.chunks = [];
        let x = 5;
        let yStart = 0;
        for (let i = p.random()*10+5; i > 0; i --){
            if (this.chunks.at(-1))
                x += this.chunks.at(-1).w;
            this.chunks.push(new CHUNK(p,x,yStart,possibleimages));
            yStart = this.chunks.at(-1).endY;
        }
        p.worldWidth = (this.chunks.at(-1).w + this.chunks.at(-1).x + 5) * TILESIZE;

        p.floor = new COLLIDER(p.worldWidth, TILESIZE, 0, p.height+TILESIZE*4);
        p.floor.addListener("y",p.die);

        //spawn player at second to first chunk (aesthetic reasons)
        p.player = new PLAYER(p, p.playerSprites,this.chunks[1].x*TILESIZE-TILESIZE/2,(this.chunks[1].startY-2)*TILESIZE-1);
        //spawn used door (see previous)
        p.usedDoor = new DECORE(p,this.chunks[1].x*TILESIZE-TILESIZE/2,(this.chunks[1].startY-2)*TILESIZE-1,p.usedDoorImg)
        
        //spawn player just after second to last chunk (see previous)
        p.door = new Door(p, this.chunks.at(-1).x*TILESIZE-TILESIZE/2,(this.chunks.at(-1).startY-2)*TILESIZE-1, p.doorClosedImg, p.doorUnlockedImg, p.doorOpenImg);

        //get spawn locations for keys
        let locations = [];
        for (let i = 2; i < this.chunks.length - 1; i ++){
            locations.push({x: this.chunks[i].x*TILESIZE-TILESIZE/2, y:(this.chunks[i].startY-2)*TILESIZE-1});
            //console.log(locations);
        }
        shuffle(locations,p);
        
        //spawn keys
        p.totalKeys = Math.floor(p.random()*locations.length+1);
        p.keysCollected = 0;
        p.keys = []; //clear keys
        for (let i = 0; i < p.totalKeys; i ++)
            p.keys.push(new Key(p, locations[i].x, locations[i].y, p.keyImage));

    }
    draw(){
        this.p.usedDoor.draw();

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
        this.endY = 0;
        this.tiles = [];
        let design = [];
        let designInfo = {};
        let doGenerate = p.random()*100 > D_RATIO;
        //generate a possible layout of tiles
        if (doGenerate){
            this.w = Math.floor(p.random()*10+5);
            this.h = Math.floor(p.height/TILESIZE)-1;
            let pStartCoords = [];
            for (let y = 0; y < this.h; y++){
                let temp = [];
                for (let x = 0; x < this.w; x++){
                    temp.push(1);
                    if (y >= playerYAtChunkStart - 2 && x == 0)
                        pStartCoords.push(y);
                }
                design.push(temp)
            }
            let y0 = p.random(pStartCoords);
            let direction = p.random([-1,1]);
            let distance = 4;
            designInfo.y0 = y0;
            for (let x = 0; x < this.w; x++){
                for (let y = -3; y < 0; y++)
                    if (design[y0+y])
                        design[y0+y][x] = 0;
                if (distance > 3 || x == this.w-1){
                    design[y0][x] = F;
                    distance = 0;
                }else
                    distance ++;
                let temp = y0;
                y0 = p.constrain(y0 + p.random([-1,0,1,direction,direction]),4,this.h-1);
                distance += (temp-y0)+.5;
            }
            designInfo.y1 = y0;
        //use one of the pre generated possible layouts of tiles
        }else{
            do{ //make sure to not generate oob
                designInfo = p.random(designedRegions);
            }while ((designInfo.y1-designInfo.y0)+this.startY > p.height/TILESIZE)
            //design = designInfo.p.slice(); man i wish javascript worked
            this.w = designInfo.p[0].length;
            this.h = designInfo.p.length;
            design = [];
            for (let y = 0; y < this.h; y++){
                let temp = [];
                for (let x = 0; x < this.w; x++)
                    temp.push(designInfo.p[y][x]);
                design.push(temp);
            }
        }
        //place tiles in the level
        for (let y = 0; y < this.h; y++){
            for (let x = 0; x < this.w; x++){
                if (p.random()*9 >= design[y][x])
                    continue;
                if (design[y+1] && design[y+1][x] && design[y+1][x+1] && design[y][x+1] && (p.random()*100 < REPLACE_BIG)){
                    design[y+1][x] = 0;
                    design[y+1][x+1] = 0;
                    design[y][x+1] = 0;
                    new TILE(p,x+this.x,y+this.startY-designInfo.y0,p.random(possibleimages.big));
                }else{
                    new TILE(p,x+this.x,y+this.startY-designInfo.y0,p.random(possibleimages.sml));
                }
            }
        }
        //console.log(design);
        this.endY = (designInfo.y1-designInfo.y0)+this.startY;
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
        this.cull = 20*TILESIZE;
        this.y = y;
        if (!screenCoords){
            this.x *= TILESIZE;
            this.y *= TILESIZE;
        }
        this.col = new COLLIDER(this.w,this.h,this.x,this.y);
        AllTiles.push(this);
    }
    draw(){
        if (this.x > this.p.player.col.getPosition("x")-this.cull && this.x < this.p.player.col.getPosition("x")+this.cull)
            this.p.image(this.image,this.x,this.y,this.w,this.h);
    }
}