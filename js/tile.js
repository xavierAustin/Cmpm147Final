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
    }
    draw(){
        this.p.image(this.image,this.x,this.y,this.w,this.h);
    }
}