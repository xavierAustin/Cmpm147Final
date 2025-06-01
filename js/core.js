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
            runUp: [p.loadImage('./assets/player/run0.png'),p.loadImage('./assets/player/run1.png'),p.loadImage('./assets/player/run2.png')],
            runDw: [p.loadImage('./assets/player/run0.png'),p.loadImage('./assets/player/run1.png'),p.loadImage('./assets/player/run2.png')],
            jump: [],
            jumpUp: [],
            jumpDw: [],
            fall: [],
            fallUp: [],
            fallDw: [],
            sleep: [p.loadImage('./assets/player/sit.png'),p.loadImage('./assets/player/sit.png')]
        });
        //debug floor
        p.floor = new COLLIDER(p.width,32,0,p.height-32);
    }
    p.draw = function(){
        p.background(125);
        let keys = Object.getOwnPropertyNames(inputs);
        //update inputs such that pressed and released only occur for the frame they are pressed/released
        for (let i = 0; i < keys.length; i++){
            inputs[keys[i]].p = false;
            inputs[keys[i]].r = false;
        }
        p.player.update();
        p.player.draw();
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