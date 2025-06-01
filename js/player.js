class PLAYER{
    constructor(images = {}, x = 0, y = 0, w = 8, h = 24, bbx = 4, bby = 8){
        if (Object.keys(images).length == 0)
            console.log("Player has no frame data.");
        this.col = new COLLIDER(w,h,x,y,0,0,bbx,bby);
        this.frame = images;
    }
    update(){

    }
    draw(){

    }
}