const COLLIDERDEBUG = true;

inputs = {
    jump: {r:false,p:false,h:false},
    act: {r:false,p:false,h:false},
    up: {r:false,p:false,h:false},
    down: {r:false,p:false,h:false},
    left: {r:false,p:false,h:false},
    right: {r:false,p:false,h:false}
}

platformAreas = [
    [ // Wide horizontal platform
        [1,1,1,1,1]
    ],
    [ // Shorter horizontal platform
        [1,1,1]
    ],
    [ // Slightly staggered horizontal platform
        [0,1,1,1,0]

    ]
    
]

s = function(p){
    p.preload = function(){
        
    }
    p.setup = function(){
        p.createCanvas(1080,810).parent("canvasContainer");
        //if we're using pixel art this'd be a good idea
        p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
        //remove some caret browsing features (if we use space as an input it wont forcibly shoot the user to the bottom of the page)
        window.addEventListener("keydown", function(e) { if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].indexOf(e.code) > -1) {e.preventDefault();}}, false);
        p.cameraOffset = 0;
        p.worldWidth = p.width * 2; // Set world width to 2x window width
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
            sleep: [p.loadImage('./assets/player/sleep.png')],
            grapple: p.loadImage('./assets/player/grapple.png')
        });
        //stuff for placeholder images remove if an actual custom sprite or anim is made for jump/fall
        p.player.anim.jump.push(p.player.anim.run.at(-1));
        p.player.anim.jumpUp.push(p.player.anim.runUp.at(-1));
        p.player.anim.jumpDw.push(p.player.anim.runDw.at(-1));
        p.player.anim.fall.push(p.player.anim.run.at(0));
        p.player.anim.fallUp.push(p.player.anim.runUp.at(0));
        p.player.anim.fallDw.push(p.player.anim.runDw.at(0)); 
        //debug floor and platforms
        p.floor = new COLLIDER(p.worldWidth, 32, 0, p.height-32);
        p.randomSeed()
        p.platforms = [];
        p.tileSize = 40;
        p.generatePlatforms();
        p.generatePlatforms();

        let button = document.getElementById("randomizeBtn");
        button.addEventListener("click", () => {
            AllColliders = []; // clear colliders
            p.generatePlatforms(); // regenerate platforms
        
            // reset player to ground
            p.player.col.setPosition(0,10); // Adjust X/Y as needed
            p.player.col.setVelocity(0,0); // Stop any falling motion
            p.player.state = "idle"; // Reset state so animations work as expected
        
});

    }
    p.draw = function(){
        p.background(125);
        
        // Update camera position to follow player
        let targetOffset = p.player.col.getPosition("x") - p.width/2;
        p.cameraOffset = p.lerp(p.cameraOffset, targetOffset, 0.1);
        
        // Clamp camera offset to world bounds
        p.cameraOffset = p.constrain(p.cameraOffset, 0, p.worldWidth - p.width);
        
        p.push();
        p.translate(-p.cameraOffset, 0);
        
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
        p.rect(0,p.height-32, p.worldWidth,32) //floor
        for (let y = 0; y < p.height/p.tileSize; y++) {
            for (let x = 0; x < p.worldWidth/p.tileSize; x++) {
                if (p.platforms[y][x] == 1) {
                    p.rect(x*p.tileSize, y*p.tileSize+18, p.tileSize, p.tileSize)
                }
            }
        }
        p.pop();
    }
    p.keyPressed = function(e){
        switch (e.code){
            case('KeyS'):
            case ('ArrowDown'): 
                inputs.down = {r:false, p:true, h: true};
            break;
            case('KeyA'):
            case ('ArrowLeft'): 
                inputs.left = {r:false, p:true, h: true};
            break;
            case ('KeyW'):
            case ('ArrowUp'): 
                inputs.up = {r:false, p:true, h: true};
            break;
            case ('KeyD'):
            case ('ArrowRight'): 
                inputs.right = {r:false, p:true, h: true};
            break;
            case ('KeyZ'):
            case ('Space'): 
                inputs.jump = {r:false, p:true, h: true};
            break;
            case ('ShiftLeft'): 
            case ('ShiftRight'):
            case ('KeyX'): 
                inputs.act = {r:false, p:true, h: true};
            break;
        }
    }
    p.keyReleased = function(e){
        switch (e.code){
            case('KeyS'):
            case ('ArrowDown'): 
                inputs.down = {r:true, p:false, h: false};
            break;
            case('KeyA'):
            case ('ArrowLeft'): 
                inputs.left = {r:true, p:false, h: false};
            break;
            case ('KeyW'):
            case ('ArrowUp'): 
                inputs.up = {r:true, p:false, h: false};
            break;
            case ('KeyD'):
            case ('ArrowRight'): 
                inputs.right = {r:true, p:false, h: false};
            break;
            case ('KeyZ'):
            case ('Space'): 
                inputs.jump = {r:true, p:false, h: false};
            break;
            case ('ShiftLeft'): 
            case ('ShiftRight'):
            case ('KeyX'): 
                inputs.act = {r:true, p:false, h: false};
            break;
        }
    }

    p.generatePlatforms = function() {
        for (let y = 0; y < p.height/p.tileSize; y++) {
            p.platforms[y] = []
        }
        for (let y = 0; y < p.height/p.tileSize; y++) {
            for (let x = 0; x < p.worldWidth/p.tileSize; x++) {
                if (x < 5) {
                    p.platforms[y][x] = -1
                } else if (p.random() < 0.01) {
                    p.generateSubArea(0,x,y)
                } else if (p.random() < 0.02) {
                    p.generateSubArea(1,x,y)
                } else if (p.platforms[y][x] == null) {
                    p.platforms[y][x] = 0
                }
            }
        }
        // Add walls at both ends of the level
        for (let y = 0; y < p.height/p.tileSize; y++) {
            // Left wall
            p.platforms[y][0] = 1;
            new COLLIDER(p.tileSize, p.tileSize, 0, y*p.tileSize+18);
            
            // Right wall
            p.platforms[y][p.worldWidth/p.tileSize - 1] = 1;
            new COLLIDER(p.tileSize, p.tileSize, (p.worldWidth/p.tileSize - 1)*p.tileSize, y*p.tileSize+18);
        }
        // Fill bottom row with solid tiles and colliders
        let bottomRow = Math.floor(p.height / p.tileSize) - 1;
        for (let x = 0; x < p.worldWidth / p.tileSize; x++) {
            p.platforms[bottomRow][x] = 1;
            new COLLIDER(
                p.tileSize,
                p.tileSize,
                x * p.tileSize,
                bottomRow * p.tileSize + 18
            );
        }

        console.log(p.platforms)
    }

    p.generateSubArea = function(subAreaNum, x, y) {
        console.log(platformAreas[subAreaNum])
        for (let j = 0; j < platformAreas[subAreaNum].length; j++) {
            for (let i = 0; i < platformAreas[subAreaNum][0].length; i++) {
                console.log(i,j,platformAreas[subAreaNum][j][i])
                if (p.platforms[y+j] != undefined && platformAreas[subAreaNum][j][i] != 0) {
                    p.platforms[y+j][x+i] = platformAreas[subAreaNum][j][i]
                    new COLLIDER(p.tileSize, p.tileSize,(x+i)*p.tileSize, (y+j)*p.tileSize+18);
                }
            }
        }
    }
}

var myp5_1 = new p5(s, "container");