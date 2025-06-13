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
        this.hasDoubleJumped = false; // Track if player has used their double jump
        this.sleepTimer = 0;
        this.grapple = null;
        this.BBinfo = {w:w,h:h,BBx:bbx,BBy:bby,hHalf:h/2};
        this.hasDoubleJumped = false; // Track if player has used their double jump
    }
    update(){
        let x = this.col.getPosition("x");
        let y = this.col.getPosition("y");
        let _dx = this.col.getVelocity("x") / 4;
        let _dy = this.col.getVelocity("y") / 4;
        let move = (inputs.right.h-inputs.left.h) * 1.4;
        let grounded = this.col.meetingSolid(x,y+2);
        this.aim = (inputs.down.h-inputs.up.h);
        this.jumpBuffer = Math.max(this.jumpBuffer - 1, 0);
        //console.log(this.jumpBuffer);
        //6 frames buffer (if you press jump early youll jump whenever possible)
        if (inputs.jump.p)
            this.jumpBuffer = 6;
        switch (this.state){
            default:
                this.hasDoubleJumped = false;
                _dx /= 5;
                _dy = 1.5;
                if (inputs.act.h)
                    this.state = "crouch";
                if (this.jumpBuffer){
                    _dy = -2.7;
                    this.state = "jump";
                    this.hasDoubleJumped = false; // Reset double jump when landing
                    this.p.jumpSound.play();
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.currentTime = 0;
                }else if (move != 0){
                    this.state = "run";
                    if (this.p.stepSound.paused) 
                        this.p.stepSound.play();
                    else if(!this.p.stepSound.paused)
                        this.p.stepSound.pause();
                }
                else if (!grounded)
                    this.ctjump ++;
                if (this.ctjump > 3)
                    this.state = "fall";
            break;
            case "run":
                if (this.p.stepSound.paused) 
                    this.p.stepSound.play();
                this.hasDoubleJumped = false;
                _dx = (move+_dx*4)/5;
                _dy = 1.5;
                if (inputs.act.h)
                    this.state = "crawl";
                if (this.jumpBuffer){
                    _dy = -3.2;
                    this.state = "jump";
                    this.p.jumpSound.currentTime = 0;
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.play();
                }else if (!grounded)
                    this.ctjump ++;
                else if (move == 0)
                    this.state = "idle";
                if (this.ctjump > 3)
                    this.state = "fall";
                if (this.state != "run")
                    this.p.stepSound.pause();
            break;
            case "jump":
                this.ctjump = 0;
                this.jumpBuffer = 0;
                if (!inputs.jump.h && _dy < 0)
                    _dy *= 0.6;
                _dx = (move + _dx*8)/9;
                _dy += 0.17-0.1*(_dy > -1 && inputs.jump.h);
                if (inputs.jump.p && inputs.act.h && this.p.canDoubleJump && !this.hasDoubleJumped){
                    this.state = "crouch"; //crouch jump
                    this.hasDoubleJumped = true;
                    _dx = move * 1.3;
                    _dy = -2.7;
                    this.p.jumpSound.currentTime = 0;
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.play();
                }else if (inputs.jump.p && this.p.canDoubleJump && !this.hasDoubleJumped){
                    this.state = "jump";
                    this.hasDoubleJumped = true;
                    _dx = move * 1.3;
                    _dy = -2.7;
                    this.p.jumpSound.currentTime = 0;
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.play();
                }else if (inputs.act.h){
                    this.state = "crouch";
                    _dy -= 1;
                }if (_dy > 1)
                    this.state = "fall";
                else if (move == 0 && grounded)
                    this.state = "idle";
                else if (grounded)
                    this.state = "run";
                if (grounded){
                    this.p.landSound.currentTime = 0;
                    this.p.landSound.play();
                }
            break;
            case "fall":
                this.ctjump = 0;
                _dx = (move + _dx*8)/9;
                _dy += 0.25;
                if (inputs.jump.p && inputs.act.h && this.p.canDoubleJump && !this.hasDoubleJumped){
                    this.state = "crouch"; //crouch jump
                    this.hasDoubleJumped = true;
                    this.p.jumpSound.currentTime = 0;
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.play();
                    _dx = move * 1.3;
                    _dy = -2.7;
                }else if (inputs.jump.p && this.p.canDoubleJump && !this.hasDoubleJumped){
                    this.state = "jump";
                    this.p.jumpSound.currentTime = 0;
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.play();
                    this.hasDoubleJumped = true;
                    _dx = move * 1.3;
                    _dy = -2.7;
                }else if (inputs.act.h)
                    this.state = "crouch";
                else if (move == 0 && (_dy > 0) && grounded)
                    this.state = "idle";
                else if (grounded && (_dy > 0))
                    this.state = "run";
                if (grounded){
                    this.p.landSound.currentTime = 0;
                    this.p.landSound.play();
                }
            break;
            case "crouch":
                if (grounded)
                    this.hasDoubleJumped = false;
                _dy += 0.25 - 0.08*(this.p.canDoubleJump);
                _dx = (move + _dx*8)/9;
                if (move != 0 && grounded && !this.jumpBuffer)
                    this.state = "crawl";
                if (inputs.jump.p && this.p.canDoubleJump && !this.hasDoubleJumped){
                    this.hasDoubleJumped = true; //crouch jump
                    _dx = move * 1.5;
                    _dy = -2.7;
                }
                if (this.jumpBuffer && grounded){
                    _dy = -2.7;
                    this.p.jumpSound.currentTime = 0;
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.play();
                    if (this.p.canDoubleJump){
                        _dx = move * 1.5;
                        _dy = -2;
                    }
                    this.jumpBuffer = 0;
                }
                this.ctjump = 0;
                if (grounded){
                    //this.p.landSound.currentTime = 0;
                    //this.p.landSound.play();
                }
                this.col.setBounds(this.BBinfo.w,this.BBinfo.hHalf,this.BBinfo.BBx,this.BBinfo.BBy+this.BBinfo.hHalf);
                if (inputs.act.h || this.col.meetingSolid(x,y-this.BBinfo.hHalf))
                    break;
                this.col.setBounds(this.BBinfo.w,this.BBinfo.h,this.BBinfo.BBx,this.BBinfo.BBy);
                if (inputs.jump.p && this.p.canDoubleJump && !this.hasDoubleJumped){
                    this.state = "jump";
                    this.hasDoubleJumped = true;
                    this.p.jumpSound.currentTime = 0;
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.play();
                    _dx = move * 1.5;
                    _dy = -2.7;
                }else if (!grounded)
                    this.state = "fall";
                else if (move == 0)
                    this.state = "idle";
                else
                    this.state = "run";
            break;
            case "crawl":
                this.hasDoubleJumped = false;
                _dx = (move+_dx*4)/7;
                _dy = 1.5;
                if (move == 0 || !grounded)
                    this.state = "crouch";
                if (this.jumpBuffer && grounded){
                    this.state = "crouch";
                    _dy = -2.7;
                    this.p.jumpSound.currentTime = 0;
                    this.p.jumpSound.preservesPitch = false;
                    this.p.jumpSound.playbackRate = 0.7+Math.random();
                    this.p.jumpSound.play();
                    if (this.p.canDoubleJump){
                        _dx = move * 1.3;
                        _dy = -2;
                    }
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