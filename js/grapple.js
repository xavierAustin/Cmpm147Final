const HALFPI = Math.PI/2;

class GRAPPLE{
    constructor(player,x,y,dx,dy,w,h){
        //assumes player has access to p5js context!
        //assumes player.anim has "grapple" property!
        console.log(x)
        this.player = player;
        this.image = player.anim.grapple;
        this.col = new COLLIDER(w,h,x,y,dx,dy,-w/2,-h/2);
        this.state = "thrown";
        this.facing = Math.sign(dx);
        this.rot = (this.facing==-1)*(-Math.PI/2);
        this.col.addListener("x",()=>{this.state = "hit"});
        this.col.addListener("y",()=>{this.state = "hit"});
        this.ttl = 1000;
    }
    update(){
        if (this.ttl < 0 || (this.state != "thrown" && (inputs.jump.p || inputs.act.p))){
            this.col.destroy();
            return null;
        }
        if (this.state == "thrown"){
            this.ttl --;
            let temp = this.col.getVelocity();
            this.col.setVelocity(temp.x, temp.y + 0.4);
            this.col.update();
        }else{
            let temp = this.player.col.getVelocity();
            this.player.col.setVelocity(temp.x,temp.y-1);
        }
        return this;
    }
    draw(){
        this.rot += this.facing*0.2;
        let p = this.player.p;
        let scale = this.col.getBounds();
        p.push();
        p.translate(this.col.getPosition("x"),this.col.getPosition("y"));
        p.rotate(Math.round(this.rot/(HALFPI))*HALFPI);
        p.image(this.image,-scale.x/2,-scale.y/2,scale.x,scale.y);
        p.pop();
    }
}