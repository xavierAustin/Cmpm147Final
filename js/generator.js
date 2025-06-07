var AllTiles = [];

class LEVELGEN {
    
}

class CHUNK {
    constructor(p,xStart,playerYAtChunkStart,possibleimages){
        this.p = p;
        this.images = possibleimages;
        this.w = Math.floor(Math.random()*20+1)*TILESIZE;
        this.x = xStart;
        this.y = playerYAtChunkStart;
    }
    draw(){
        this.p.image(this.image,this.x,this.y,this.w,this.h);
    }
}

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