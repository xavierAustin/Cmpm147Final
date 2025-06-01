class PLAYER{
    constructor(p, images = {}, x = 0, y = 0, w = 40, h = 96, bbx = 44, bby = 32){
        if (Object.keys(images).length == 0)
            console.log("Player has no frame data.");
        this.p = p;
        this.col = new COLLIDER(w,h,x,y,0,0,bbx,bby);
        this.anim = images;
        this.ctjump = 0; //coyote time jump (if you press jump late you still get to jump)
        this.jumpBuffer = 0;
        this.state = "idle";
        this.anim_index = 0;
        this.anim_current = "idle";
        this.facing = 1;
    }
    update(){
        let x = this.col.getPosition("x");
        let y = this.col.getPosition("y");
        let _dx = this.col.getVelocity("x") / 4;
        let _dy = this.col.getVelocity("y") / 4;
        let move = (inputs.right.h-inputs.left.h) * 1.4;
        this.jumpBuffer -= Math.max(this.jumpBuffer - 1, 0);
        //six frames of buffer (if you press jump early youll jump whenever possible)
        if (inputs.jump.p)
            this.jumpBuffer = 6;
        switch (this.state){
            default:
                //image_index = (idleanim > 0)*12+(idleanim == 500)
                _dx /= 5;
                _dy = 1.5;
                //idleanim = min(idleanim + 1,500);
                if (this.jumpBuffer){
                    _dy = -3.9;
                    this.state = "jump";
                }else if (move != 0)
                    this.state = "run";
                else if (!this.col.meeting(x,y+2))
                    this.ctjump ++;
                if (this.ctjump > 3)
                    this.state = "fall";
                //if state != "idle" || ku || kd || ks
                //    idleanim = -600 + irandom_range(-120,60);
            break;
            case "run":
                _dx = (move+_dx*4)/5;
                _dy = 1.5;
                if (this.jumpBuffer){
                    _dy = -4.5;
                    this.state = "jump";
                }else if (!this.col.meeting(x,y+2))
                    this.ctjump ++;
                else if (move == 0)
                    this.state = "idle";
                if (this.ctjump > 3)
                    this.state = "fall";
            break;
            case "jump":
                this.ctjump = 0;
                this.jumpBuffer = 0;
                //image_index = 3;
                if (!inputs.jump.h && _dy < 0)
                    _dy *= 0.6;
                _dx = (move + _dx*8)/9;
                _dy += 0.17-0.1*(_dy > -1 && inputs.jump.h);
                if (_dy > 1)
                    this.state = "fall";
                else if (move == 0 && this.col.meeting(x,y+2))
                    this.state = "idle";
                else if (this.col.meeting(x,y+2))
                    this.state = "run";
            break;
            case "fall":
                this.ctjump = 0;
                //image_index = 1;
                _dx = (move + _dx*8)/9;
                _dy += 0.25;
                if (move == 0 && this.col.meeting(x,y+2))
                    this.state = "idle";
                else if (this.col.meeting(x,y+2))
                    this.state = "run";
            break;
        }
        //handle animations
        this.anim_index = (this.anim_index + 0.33);
        this.anim_current = this.state;
        if (inputs.down.h && !inputs.up.h)
            this.anim_current += "Dw";
        if (!inputs.down.h && inputs.up.h)
            this.anim_current += "Up";
        if (move != 0)
            this.facing = Math.sign(move);
        //handle collision
        this.col.setVelocity(_dx * 4, _dy * 4);
        this.col.update();
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