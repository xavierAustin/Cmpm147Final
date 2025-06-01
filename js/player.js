class PLAYER{
    constructor(p, images = {}, x = 0, y = 0, w = 16, h = 96, bbx = 48, bby = 32){
        if (Object.keys(images).length == 0)
            console.log("Player has no frame data.");
        this.p = p;
        this.col = new COLLIDER(w,h,x,y,0,0,bbx,bby);
        this.anim = images;
        this.state = "idle";
    }
    update(){
        switch (this.state){
            default:
            break;
        }
        this.col.setVelocity(1, this.col.getVelocity("y") + 0.1);
        this.col.update();
    }
    draw(){
        this.p.push();
        this.p.translate(this.col.getPosition("x"),this.col.getPosition("y"));
        this.p.scale(1,1);
        this.p.image(this.anim.idle[0],0,0,128,128);
        this.p.pop();
    }
}