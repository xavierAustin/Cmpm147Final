class PLAYER{
    constructor(p, images = {}, x = 20, y = -160, w = 30, h = 70, bbx = 49, bby = 58){
        if (Object.keys(images).length == 0)
            console.log("Player has no frame data.");
        this.p = p;
        this.col = new COLLIDER(w,h,x,y,0,0,bbx,bby);
        this.anim = images;
        this.ctjump = 0; //3 frame coyote time jump (if you press jump late you still get to jump)
        this.jumpBuffer = 0;
        this.state = "idle";
        this.anim_index = 0;
        this.anim_current = "idle";
        this.facing = 1;
        this.aim = 0;
        this.sleepTimer = 0;
        this.grapple = null;
        this.BBinfo = {w:w,h:h,BBx:bbx,BBy:bby,hHalf:h/2};
    }
    update(){
        let x = this.col.getPosition("x");
        let y = this.col.getPosition("y");
        let _dx = this.col.getVelocity("x") / 4;
        let _dy = this.col.getVelocity("y") / 4;
        let move = (inputs.right.h-inputs.left.h) * 1.4;
        this.aim = (inputs.down.h-inputs.up.h);
        this.jumpBuffer = Math.max(this.jumpBuffer - 1, 0);
        //console.log(this.jumpBuffer);
        //6 frames buffer (if you press jump early youll jump whenever possible)
        if (inputs.jump.p)
            this.jumpBuffer = 6;
        switch (this.state){
            default:
                _dx /= 5;
                _dy = 1.5;
                if (inputs.act.h)
                    this.state = "crouch";
                if (this.jumpBuffer){
                    _dy = -2.7;
                    this.state = "jump";
                }else if (move != 0)
                    this.state = "run";
                else if (!this.col.meetingSolid(x,y+2))
                    this.ctjump ++;
                if (this.ctjump > 3)
                    this.state = "fall";
            break;
            case "run":
                _dx = (move+_dx*4)/5;
                _dy = 1.5;
                if (inputs.act.h)
                    this.state = "crawl";
                if (this.jumpBuffer){
                    _dy = -3.2;
                    this.state = "jump";
                }else if (!this.col.meetingSolid(x,y+2))
                    this.ctjump ++;
                else if (move == 0)
                    this.state = "idle";
                if (this.ctjump > 3)
                    this.state = "fall";
            break;
            case "jump":
                this.ctjump = 0;
                this.jumpBuffer = 0;
                if (!inputs.jump.h && _dy < 0)
                    _dy *= 0.6;
                _dx = (move + _dx*8)/9;
                _dy += 0.17-0.1*(_dy > -1 && inputs.jump.h);
                if (inputs.act.h)
                    this.state = "crouch";
                if (_dy > 1)
                    this.state = "fall";
                else if (move == 0 && this.col.meetingSolid(x,y+2))
                    this.state = "idle";
                else if (this.col.meetingSolid(x,y+2))
                    this.state = "run";
            break;
            case "fall":
                this.ctjump = 0;
                _dx = (move + _dx*8)/9;
                _dy += 0.25;
                if (inputs.act.h)
                    this.state = "crouch";
                if (move == 0 && (_dy > 0) && this.col.meetingSolid(x,y+2))
                    this.state = "idle";
                else if (this.col.meetingSolid(x,y+2) && (_dy > 0))
                    this.state = "run";
            break;
            case "crouch":
                _dy += 0.25;
                _dx = (move + _dx*8)/9;
                if (move != 0 && this.col.meetingSolid(x,y+2))
                    this.state = "crawl";
                if (this.jumpBuffer && this.col.meetingSolid(x,y+2))
                    _dy = -2.7;
                this.ctjump = 0;
                this.jumpBuffer = 0;
                this.col.setBounds(this.BBinfo.w,this.BBinfo.hHalf,this.BBinfo.BBx,this.BBinfo.BBy+this.BBinfo.hHalf);
                if (inputs.act.h || this.col.meetingSolid(x,y-this.BBinfo.hHalf))
                    break;
                this.col.setBounds(this.BBinfo.w,this.BBinfo.h,this.BBinfo.BBx,this.BBinfo.BBy);
                if (!this.col.meetingSolid(x,y+2))
                    this.state = "fall";
                else if (move == 0)
                    this.state = "idle";
                else
                    this.state = "run";
            break;
            case "crawl":
                _dx = (move+_dx*4)/7;
                _dy = 1.5;
                if (move == 0 || !this.col.meetingSolid(x,y+2))
                    this.state = "crouch";
                if (this.jumpBuffer){
                    this.state = "crouch";
                    _dy = -2.7;
                    this.jumpBuffer = 0;
                }
                this.col.setBounds(this.BBinfo.w,this.BBinfo.hHalf,this.BBinfo.BBx,this.BBinfo.BBy+this.BBinfo.hHalf);
                if (inputs.act.h || this.col.meetingSolid(x,y-this.BBinfo.hHalf))
                    break;
                this.col.setBounds(this.BBinfo.w,this.BBinfo.h,this.BBinfo.BBx,this.BBinfo.BBy);
                if (move == 0)
                    this.state = "idle";
                else
                    this.state = "run";
            break;
        }
        //handle animations
        this.anim_index = (this.anim_index + 0.33);
        this.anim_current = this.state;
        if (this.aim == 1 && this.state != "crawl" && this.state != "crouch")
            this.anim_current += "Dw";
        if (this.aim == -1 && this.state != "crawl" && this.state != "crouch")
            this.anim_current += "Up";
        if (move != 0)
            this.facing = Math.sign(move);
        if (this.state != "idle" || this.aim)
            this.sleepTimer = this.p.frameCount
        else if (this.p.frameCount - this.sleepTimer > 1500)
            this.anim_current = "sleep";
        else if (this.p.frameCount - this.sleepTimer > 900)
            this.anim_current = "sit";
        //handle collision (also set terminal velocity)
        this.col.setVelocity(_dx * 4, Math.min(_dy, 6) * 4);
        this.col.update();
        //grappling hook :))
        //grapple class assumes player has access to p5js context!
        //grapple class assumes this.anim has "grapple" property!
        if (this.grapple != null){
            this.grapple.draw();
            this.grapple = this.grapple.update();
        }else if (false){//(inputs.act.p){
            //slightly nudge based on movement; 1/4 dx and dy applied
            this.grapple = new GRAPPLE(
                this,
                x - 32 + 128 * (this.facing == 1),
                y,
                _dx + this.facing * (5 - Math.abs(this.aim * 3)),
                _dy + (this.aim == 1) * 12 - 8 - (this.aim == -1) * 3,
                64,
                64
            );
        }
    }
    draw(){
        this.p.push();
        this.p.translate(this.col.getPosition("x"),this.col.getPosition("y"));
        this.p.translate((this.facing == -1)? 128 : 0, 0);
        this.p.scale(this.facing,1);
        let temp = this.anim[this.anim_current].length
        this.p.image(this.anim[this.anim_current][Math.floor(this.anim_index) % temp],0,0,128,128);
        this.p.pop();
    }
}