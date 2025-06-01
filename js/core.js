s = function(p){
    p.preload = function(){
        
    }
    p.setup = function(){
        p.createCanvas(800,800).parent("canvasContainer");
        //if we're using pixel art this'd be a good idea
        //p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
        //remove some caret browsing features (if we use space as an input it wont forcibly shoot the user to the bottom of the page)
        window.addEventListener("keydown", function(e) { if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].indexOf(e.code) > -1) {e.preventDefault();}}, false);
        p.player = new PLAYER({
            idle: [p.loadImage('./assets/player/idle.png')],
            idleUp: [p.loadImage('./assets/player/idle_lookup.png')],
            idleDw: [p.loadImage('./assets/player/idle_lookdown.png')],
            idle: [p.loadImage('./assets/player/idle.png')],
            idleUp: [p.loadImage('./assets/player/idle_lookup.png')],
            idleDw: [p.loadImage('./assets/player/idle_lookdown.png')],
            sleep: [p.loadImage('./assets/player/sit.png'),p.loadImage('./assets/player/sit.png')]
        });
    }
    p.draw = function(){
        p.background(125);
        p.translate(p.width/2,p.height/2);
        p.rotate(p.frameCount * 0.01);
        p.square(-40,-40,80);
    }
}

var myp5_1 = new p5(s, "container");