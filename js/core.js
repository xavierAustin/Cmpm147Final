const COLLIDERDEBUG = true;

inputs = {
    jump: {r:false,p:false,h:false},
    act: {r:false,p:false,h:false},
    up: {r:false,p:false,h:false},
    down: {r:false,p:false,h:false},
    left: {r:false,p:false,h:false},
    right: {r:false,p:false,h:false}
}

s = function(p){
    p.preload = function(){
        
    }
    p.setup = function(){
        p.createCanvas(1080,810).parent("canvasContainer");
        //if we're using pixel art this'd be a good idea
        p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
        //remove some caret browsing features (if we use space as an input it wont forcibly shoot the user to the bottom of the page)
        window.addEventListener("keydown", function(e) { if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].indexOf(e.code) > -1) {e.preventDefault();}}, false);
        p.player = new PLAYER(p, {
            idle: [p.loadImage('./assets/player/idle.png')],
            idleUp: [p.loadImage('./assets/player/idle_lookup.png')],
            idleDw: [p.loadImage('./assets/player/idle_lookdown.png')],
            run: [p.loadImage('./assets/player/run0.png'),p.loadImage('./assets/player/run1.png'),p.loadImage('./assets/player/run2.png')],
            runUp: [p.loadImage('./assets/player/run0_lookup.png'),p.loadImage('./assets/player/run1_lookup.png'),p.loadImage('./assets/player/run2_lookup.png')],
            runDw: [p.loadImage('./assets/player/run0_lookdown.png'),p.loadImage('./assets/player/run1_lookdown.png'),p.loadImage('./assets/player/run2_lookdown.png')],
            jump: [],
            jumpUp: [],
            jumpDw: [],
            fall: [],
            fallUp: [],
            fallDw: [],
            sit: [p.loadImage('./assets/player/sit.png')],
            sleep: [p.loadImage('./assets/player/sleep.png')]
        });
        //stuff for placeholder images remove if an actual custom sprite or anim is made for jump/fall
        p.player.anim.jump.push(p.player.anim.run.at(-1));
        p.player.anim.jumpUp.push(p.player.anim.runUp.at(-1));
        p.player.anim.jumpDw.push(p.player.anim.runDw.at(-1));
        p.player.anim.fall.push(p.player.anim.run.at(0));
        p.player.anim.fallUp.push(p.player.anim.runUp.at(0));
        p.player.anim.fallDw.push(p.player.anim.runDw.at(0)); 
        //debug floor and platforms
        p.floor = new COLLIDER(p.width,32,0,p.height-32);
        p.floor = new COLLIDER(400,32,200,p.height-236);
    }
    p.draw = function(){
        p.background(125);
        //update player
        p.player.update();
        //update stuff

        //debug colision draw
        for (let i = 0; i < COLLIDERDEBUG * AllColliders.length; i ++){
            p.rect(AllColliders[i].x+AllColliders[i].xBB,AllColliders[i].y+AllColliders[i].yBB,AllColliders[i].w,AllColliders[i].h)
        }
        //draw player
        p.player.draw();
        //draw stuff

        //update inputs such that pressed and released only occur for the frame they are pressed/released
        let keys = Object.getOwnPropertyNames(inputs);
        for (let i = 0; i < keys.length; i++){
            inputs[keys[i]].p = false;
            inputs[keys[i]].r = false;
        }
    }
    p.keyPressed = function(e){
        switch (e.code){
            case ('ArrowDown'): 
                inputs.down = {r:false, p:true, h: true};
            break;
            case ('ArrowLeft'): 
                inputs.left = {r:false, p:true, h: true};
            break;
            case ('ArrowUp'): 
                inputs.up = {r:false, p:true, h: true};
            break;
            case ('ArrowRight'): 
                inputs.right = {r:false, p:true, h: true};
            break;
            case ('Space'): 
                inputs.jump = {r:false, p:true, h: true};
            break;
        }
        console.log(e.code);
    }
    p.keyReleased = function(e){
        switch (e.code){
            case ('ArrowDown'): 
                inputs.down = {r:true, p:false, h: false};
            break;
            case ('ArrowLeft'): 
                inputs.left = {r:true, p:false, h: false};
            break;
            case ('ArrowUp'): 
                inputs.up = {r:true, p:false, h: false};
            break;
            case ('ArrowRight'): 
                inputs.right = {r:true, p:false, h: false};
            break;
            case ('Space'): 
                inputs.jump = {r:true, p:false, h: false};
            break;
        }
    }
}

var myp5_1 = new p5(s, "container");